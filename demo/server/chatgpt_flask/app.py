#from wsgiref.simple_server import WSGIServer
from gevent.pywsgi import WSGIServer
from flask import Flask, render_template, request, jsonify, abort
from flask_cors import CORS, cross_origin
import openai
from openai import openai_object
from utils.utils import Database, get_current_time
from utils import utils
import os, sys, json, PyPDF2
from pathlib import Path
# Set up OpenAI API credentials
import uuid
import requests
import json


#os.environ["OPENAI_API_TYPE"] = "azure"


openai.api_key = ''


html_path = Path(__file__).parents[2].joinpath("clients/botdesigner/build")
NOTFOUND = json.dumps({"message": "404 page not found."})

app = Flask(__name__,
            static_url_path="",
            static_folder=html_path,
            template_folder=html_path,
           )
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


def delete_files_in_folder(folder_path):
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        if os.path.isfile(file_path):
            os.remove(file_path)
        elif os.path.isdir(file_path):
            delete_files_in_folder(file_path)
            os.rmdir(file_path)








class PromptDesigner:
    """
    This class helps creates a prompt with specified paramters to send to ChatGPT
    """
    @staticmethod
    def davinci(_prompt: str, _max_tokens=50, _temperature=0.8, _n=1):
        """
        Use Davinci engine
        """
        response = openai.Completion.create(
            engine = "text-davinci-003",
            prompt = _prompt,
            max_tokens = _max_tokens,
            temperature = _temperature,
            n = _n
        )
        return response

    @staticmethod
    def turbo(chat_history):
        """
        Use gpt-3.5-turbo model
        """
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo", 
            messages=chat_history
        )
        return response


class ChatHistory():
    """
    This class helps store the chat history based on its specified role
    """
    def __init__(self) -> None:
        self.chat_history = []
        # self.chat_record_Sys_record = []
        # self.chat_record_Assistant_record = []
        self.chat_record = []

    
    def addSysContent(self, content: str):
        """ Add as a system """
        self.chat_history.append({"role":"system", "content": content.strip()})

    # def addRecordSys(self, content:str):
    #     """ Add record as a system """
    #     self.chat_record_Sys_record.append({"role":"system", "content": content.strip()})
    #
    # def addRecordAss(self, content:str):
    #     """ Add record as a assitant """
    #     self.chat_record_Sys_record.append({"role":"assitant", "content": content.strip()})

    def addRecord(self, question:str, response:str):
        """ Add record as a system """
        self.chat_record.append([question,response])
    def addAssistantContent(self, content: str):
        """ Add as a assistant """
        self.chat_history.append({"role":"assistant", "content": content.strip()})

    def addUserContent(self, content: str):
        """ Add as a user """
        self.chat_history.append({"role":"user", "content": content.strip()})


class RetPayload():
    """
    This class helps structure a json payload
    """
    @staticmethod
    def getJSON(content: str):
        return json.dumps({"content": content})


db = Database("localhost", "root", "uiuc", "GenAI")

chat = ChatHistory()



# =============================
# Controllers
# =============================
@app.route("/")
@cross_origin()
def index():
    return render_template("index.html")


@app.route("/api/v1/<action>", methods=["POST"])
def api(action):
    if request.method == "POST":

        if action == "getresponse":
            # ◼︎ Get a response from ChatGPT
            print("It has done")
            message = request.json.get("message")
            #print(message)
            chat.addUserContent(message)
            # 生成一个唯一的ID
            unique_id = uuid.uuid4()
            request_id = str(unique_id)
            #request.id = request_id
            db.connect()
            db.insert_data("Requests", (request_id, 223860001, message, get_current_time()))
            try:
                url = 'http://localhost:3000/api/chat'
                headers = {'Content-Type': 'application/json'}
                data = {
                    'question': message,
                    'history': chat.chat_record
                }
                print(chat.chat_history)
                response = requests.post(url, headers=headers, data=json.dumps(data))
                response_data = response.json()
                ai_reply = response_data.get('text')
                chat.addRecord(message, ai_reply)
                #print(text)
                # response = PromptDesigner.turbo(chat.chat_history)
                # ai_reply: openai_object.OpenAIObject = response.choices[0].message.content.strip()
                # chat.addAssistantContent(ai_reply)
            except Exception as e:
                print(e)
                ai_reply = "Failed to generate response."

            unique_id = uuid.uuid4()
            response_id = str(unique_id)
            db.insert_data("Responses", (223860001, request_id, ai_reply, '', 0, response_id))
            db.disconnect()
            return RetPayload.getJSON(ai_reply)
        
        elif action == "getdifference":
            # ◼︎ Get the differences between two responses
            payload = request.json
            response = PromptDesigner.davinci(
                _prompt=f"What's the main difference between \"{payload['prompt'][0]}\" and \"{payload['prompt'][1]}\"?"
            )
            diff_response = RetPayload.getJSON(response.choices[0].text.strip())
            db.connect()
            requestId = db.select_data("Responses", "content", payload['prompt'][0])
            print("The requestId is "+ requestId)
            unique_id = uuid.uuid4()
            response_id = str(unique_id)
            db.insert_data("Responses", (223860001, requestId, payload['prompt'][1]),diff_response,1,response_id)
            #db.insert_data("")
            db.disconnect()
            return diff_response
        

        elif action == "gethowtochange":
            # ◼︎ Get how to change a sentence into another one
            payload = request.json
            response = PromptDesigner.davinci(
                _prompt=f"Show the result of changing \"{payload['prompt'][0]}\" into \"{payload['prompt'][1]}\"?"
            )
            return RetPayload.getJSON(response.choices[0].text.strip())


        elif action == "makechange":
            # ◼︎ Submit a change in response
            payload = request.json
            chat.addSysContent(f"Response to sentences such as \"{payload['prevUserIn']}\" with \"{payload['prompt'][1]}\"")
            return RetPayload.getJSON("success")


        elif action == "appendPDFPrompt":
            # ◼︎ Upload a PDF prompt

            #TO DO: change the file storage path.

            f = request.files["files"]
            # reader = PyPDF2.PdfReader(f)
            #
            # text = ""
            # for page in reader.pages:
            #     text += page.extract_text() + "\n"
            #
            # chat.addSysContent(text)
            #
            file_storage_path = '/Users/xuzhongwei/uiuc/generative-AI/chatwithpdf-langchain/gpt4-pdf-chatbot-langchain-main/docs/'
            f = request.files['files']
            file_path = file_storage_path + f.filename
            delete_files_in_folder(file_storage_path)
            with open(file_path, 'wb') as file:
                f.save(file)  # 保存上传的文件

            url = 'http://localhost:3000/api/fileprocess'
            headers = {'Content-Type': 'application/json'}
            print(chat.chat_history)
            data = ''
            requests.post(url, headers=headers, data=json.dumps(data))



            text =  "It has uploaded success!"
            return RetPayload.getJSON(text)
        else:
            abort(404)




@app.errorhandler(404)
def page_not_found(error):
   return NOTFOUND
    



if __name__ == '__main__':
    http_server = WSGIServer(('', 5000), app)
    http_server.serve_forever()
