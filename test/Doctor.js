const parse5 = require('parse5');
regID = process.argv[2]
html = process.argv[3]
beautify(html,regID)

function beautify(html,regID) {
  const doc = parse5.parse(html.toString());
  var name;
  var qual;
  var speciality;
  var famP;
  var addressInfo;
  var answer = {}
  name = getName(doc,regID)
  if (name.includes("No such doctor for:")) {
    console.log("No such doctor exists for: " + regID)

  }else {
    qual = getQual(doc,regID)
    speciality = getSpeciality(doc,regID)
    if(speciality == "This doctor is not on the Register of Specialists") {
      speciality = "No speciality"
    }
    famP = getFamilyPhys(doc,regID)
    adressInfo = getAddress(doc,regID)
    answer.name = name
    answer.qualification = qual
    answer.specialty = speciality
    answer.familyReg = famP
    answer.workPlace = adressInfo
    console.log(JSON.stringify(answer))
  }
}

function getName(doc,regID) {
  var nameReg = doc.childNodes[1].childNodes[2].childNodes[3].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[7].childNodes[5].childNodes[1].childNodes[0].value
  if(remove(nameReg).includes('(-)')) {
    //error
    return("No such doctor for: " + regID)
  }else {
    return(remove(nameReg))
  }
}
function getQual(doc,regID) {
  try {
    var qualification=doc.childNodes[1].childNodes[2].childNodes[3].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[7].childNodes[5].childNodes[5].childNodes[1].childNodes[2].childNodes[3].childNodes
    qualArray = []
    for(var i =0;i<qualification.length;i++){
        if (qualification[i].nodeName == '#text') {
          qualArray.push(remove(qualification[i].value))
        }
    }
    if(qualArray == []) {
      return("Doctor for: " + regID + " exists, but has no qualification?? RED FLAG")
    }else {
      return(qualArray)
    }
  } catch {
    // console.log("Cannot get qualifications for " + regID)
  }

}
function getSpeciality(doc,regID) {
  return getAnswer(doc,1)
}
function getFamilyPhys(doc,regID) {
  return getAnswer(doc,2)
}
function getAddress(doc,regID) {
    var currentAddressInfo = []
    var primaryAddress = []
    try {
      var primary = doc.childNodes[1].childNodes[2].childNodes[3].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[7].childNodes[5].childNodes[19].childNodes[1].childNodes[1]
      //as current will change
      var department = remove(primary.childNodes[0].childNodes[3].childNodes[0].value)
      var address    = remove(primary.childNodes[2].childNodes[3].childNodes[0].value)
      var zipCode    = remove(primary.childNodes[2].childNodes[3].childNodes[2].value)
      var tel        = remove(primary.childNodes[4].childNodes[3].childNodes[0].value)
      primaryAddress.push([department,address,zipCode,tel])
    } catch {
      return("no primary address found")
    }
    try {
      // if secondary exist
      var secondaryAddressInfo = []
      // childNodes.26.childNodes.1.childNodes.1.childNodes.0.childNodes.3
      // childNodes.26.childNodes.4.childNodes.1.childNodes.0.childNodes.3]
      var secondary = doc.childNodes[1].childNodes[2].childNodes[3].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[7].childNodes[5].childNodes[26]
      //secondary is in index 1,4,7
      for(var j=1;j<20;j++){
         if(secondary.childNodes[j] == undefined){
           break
         }else {
           secondaryCurrent = secondary.childNodes[j]
           department = remove(secondaryCurrent.childNodes[1].childNodes[0].childNodes[3].childNodes[0].value)
           address =    remove(secondaryCurrent.childNodes[1].childNodes[2].childNodes[3].childNodes[0].value)
           zipCode =    remove(secondaryCurrent.childNodes[1].childNodes[2].childNodes[3].childNodes[2].value)
           tel =        remove(secondaryCurrent.childNodes[1].childNodes[4].childNodes[3].childNodes[0].value)
           secondaryAddress = [department,address,zipCode,tel]
           j = j+2
           secondaryAddressInfo.push(secondaryAddress)
           return("success")
         }

      }
    }catch {
      //"Secondary Address does not exist"
    }
    currentAddressInfo = {primary:primaryAddress,secondary:secondaryAddressInfo}
    return(currentAddressInfo)
}

function getAnswer(doc,flag) {
    //flag == 1 for speciality , flag == 2 for familyP
    //doc is in json already, find the location of "Entry date into Register of Family Physicians" String
    var as = doc.childNodes[1].childNodes[2].childNodes[3].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[7].childNodes[5].childNodes[12].childNodes[1].childNodes[1].childNodes
    if (flag ==1) {
      specialityArray = ['This doctor is not on the Register of Specialists']
      for(var i=0;i<as.length;i++) {
        try {
          var status = as[i].childNodes[3]
          if(status != undefined) {
            var term = status.childNodes[0].value
            if(/\(([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}\)/i.exec(term) != null) {
              if(specialityArray[0] == 'This doctor is not on the Register of Specialists') {
                specialityArray.pop()
              }
              var specialDateArray = /([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}/i.exec(term)
              specialityArray.push([term.substring(0,specialDateArray.index-2),specialDateArray[0]])
            }
          }
        }catch {
          // console.log("errror")
        }
      }
      return(specialityArray)
    } else if(flag ==2) {
      for(var i=0;i<as.length;i++) {
        try {
          var status = as[i].childNodes[3]
          if(status != undefined) {
            var term = status.childNodes[0].value
            //eliminate whatever specilists
            if(/^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/i.exec(term) != null) {
              var familyDateArray = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/i.exec(term)
              return(familyDateArray[0])
            }else {
              return("This doctor is not on the Register of Family Physicians")
            }
          }
        }catch {
          //console.log("errror")
        }
      }
    }
}

function remove(text) {
  string = text.replace(/\t\t+/g, ' ');
  string = string.replace(/\n+/g,' ');
  string = string.replace(/\s\s+/g,' ');
  return string
}
