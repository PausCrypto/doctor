import json
from string import ascii_uppercase
import doctor
import subprocess
#lets iterate the reg ids
ids = [str(num).zfill(5) for num in range(100000)]
for id in ids:
	for c in ascii_uppercase:
		f=open("doctor.log","a+")
		correctedID = 'M' + id + c
		html = doctor.get(correctedID)
		output = subprocess.check_output(['node','parse.js', correctedID, html])
		try:
		    jsonOutput = json.loads(output)
		    jsonString = json.dumps(jsonOutput)
		    print(jsonString)
		    j=open("./json/{}.json".format(correctedID),"w+")
		    j.write(jsonString)
		    f.write("Data for doctor with id: {} is saved to json \n".format(correctedID))
		except:
		    f.write("No such doctor with id: " + correctedID + "\n")
