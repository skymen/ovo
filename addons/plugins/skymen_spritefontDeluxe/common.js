function c3JSONtoC2JSON(c3json) {
  try {
    c3json = JSON.parse(c3json)
  } catch (error) {
    return ""
  }
  var result = '{' + 
    '""c2array"": true,' + 
    '""size"": [2,' + c3json.length + ', 1],' +
    '""data"":'
  
  data0 = ''
  data1 = ''
  for (var i = 0; i < c3json.length; i++) {
    var element = c3json[i];
    data0 += '[' + (element[0]) + '],'
    data1 += '[""' + (element[1]) + '""],'
  }
  data0 = data0.substring(0, data0.length - 1)
  data1 = data1.substring(0, data1.length - 1)
  result += "[[" + data0 + "],[" + data1 + "]]}"
  return result
}

