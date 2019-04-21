import json
from string import ascii_uppercase
import doctor
import subprocess

correctedID = "M00001I"
f=open("doctor.log","a+")
#correctedID = 'M' + id + c
html = doctor.get(correctedID)
argument = 'node' + './Doctor.js' + " " + correctedID + " " + html
output = subprocess.check_output(['node','Doctor.js', correctedID, html])
try:
    jsonOutput = json.loads(output)
    jsonString = json.dumps(jsonOutput)
    print(jsonString)
    j=open("./json/{}.json".format(correctedID),"w+")
    j.write(jsonString)
    f.write("Data for doctor with id: {} is saved to json \n".format(correctedID))
except:
    f.write("No such doctor with id: " + correctedID)
