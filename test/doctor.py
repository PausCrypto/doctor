import requests
import json
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
def get(id):
	html = post(id)
	return html

def post(id):
	try:
		url = "https://prs.moh.gov.sg/prs/internet/profSearch/getSearchDetails.action"
		payload = {'hpe':'SMC','regNo':id,'psearchParamVO.language':'eng','psearchParamVO.searchBy':'N','psearchParamVO.name':' ','__checkbox_psearchParamVO.startWith':'startWith','psearchParamVO.pracPlaceName':'','psearchParamVO.rbtnRegister':'all','psearchParamVO.regNo': id,'selectType':'all'}
		r = requests.post(url,data=payload,verify=False)
		return r.text
	except:
		f.open("doctor.log","a+")
		f.write("Timeout for id: {}, retrying".format(id))
		post(id)
