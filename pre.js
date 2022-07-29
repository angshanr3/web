import './Tables.css';//CSS
import React, { useState,useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.css";
import { Form } from "react-bootstrap";
import { DatePicker,TimePicker} from 'antd';
import { Link } from "react-router-dom";

import moment from 'moment';
import axios from 'axios';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import * as XLSX from 'xlsx';
import InputFiles from "react-input-files";

//路徑
import Logo from './logo/vm-logo.png';
import VMcheck2 from './Table/VMcheck/VMcheck2';
import VMcheck3 from './Table/VMcheck/VMcheck3';
import VMcheck4 from './Table/VMcheck/VMcheck4';
import VMcheckThinkness from './Table/VMcheck/VMcheck_thinkness';


/*輔助決策表格的css*/
var atStyle = {

    border: '1px solid white',
    background:'#F5C9CA',
};


//匯出Excel 
function download(json,fileName){
    const type = 'xlsx'//定義匯出檔案的格式
    var tmpDown;//匯出的內容
    var tmpdata = json[0];
    json.unshift({});
    var keyMap = []; //獲取keys
    for (var k in tmpdata) {
        keyMap.push(k);
        json[0][k] = k;
    }
    tmpdata = [];//用來儲存轉換好的json 
    
    json.map((v, i) => keyMap.map((k, j) => Object.assign({}, {
        v: v[k],
        position: (j > 25 ? getCharCol(j) : String.fromCharCode(65 + j)) + (i + 1)
    }))).reduce((prev, next) => prev.concat(next)).forEach((v, i) => tmpdata[v.position] = {
        v: v.v
    });
    var outputPos = Object.keys(tmpdata); //設定區域,比如表格從A1到D10
    var tmpWB = {
        SheetNames: ['SpecList'], //儲存的表標題
        Sheets: {
            'SpecList': Object.assign({},
                tmpdata, //內容
                {
                    '!ref': outputPos[0] + ':' + outputPos[outputPos.length - 1] //設定填充區域
                })
        }
    };
    tmpDown = new Blob([s2ab(XLSX.write(tmpWB, 
        {bookType: (type === undefined ? 'xlsx':type),bookSST: false, type: 'binary'}//這裡的資料是用來定義匯出的格式型別
        ))], {
        type: ""
    }); //建立二進位制物件寫入轉換好的位元組流
    saveAs(tmpDown,fileName);
}

function saveAs(obj, fileName){//匯出功能實現
    var tmpa = document.createElement("a");
    tmpa.download = fileName || "下載";
    tmpa.href = URL.createObjectURL(obj); //繫結a標籤
    tmpa.click(); //模擬點選實現下載
    setTimeout(function () { //延時釋放
        URL.revokeObjectURL(obj); //用URL.revokeObjectURL()來釋放這個object URL
    }, 100);
}

function s2ab(s){ //字串轉字元流
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}

function getCharCol(n){
    let temCol = '',
    s = '',
    m = 0
    while (n > 0) {
        m = n % 26 + 1
        s = String.fromCharCode(m + 64) + s
        n = (n - m) / 26
    }
    return s
}



const Predict = () => {
    
    const [Data, setData] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [startTime, setStartTime] = useState("00:00");
    const [endDate, setEndDate] = useState("");
    const [endTime, setEndTime] = useState("00:00");
    const [selectedOption, setSelectedOption] = useState("");
    const [select, setSelect] = useState("");
    const [allDose, setAllDose] = useState([]);
    const [allDoseSetting, setAllDoseSetting] = useState([]);
    const [SpecList, setSpecList] = useState(require("./Table/csvtojson.json"));

    const Rank_HH =[];
    const Rank_H = [];
    const Rank_C = [];
    const Rank_L = [];
    const Rank_LL = [];

    var check1="";

    var check2 ="";
    const check2Data =[];
    var check2kind =[];
    var check2kindT = 0;
    var check2kindF = 0;

    var best_same_DOSE_all =[];
    var dose ="";
    const check3Data = [];
    const check3Data_Rank = [];
    var check3 ="";
    var check3kind = [];

    const check4Data = [];
    const check4Data_avg = [];
    const check4Data_avgRank = [];
    var check4dose = [];
    var check4dose_Rank = [];
    var check4_TF = [];
    var check4kind = [];
    var check4 = "";

    var Check_Note ="";
    var Run ="";
    var Run_Note ="";
    const CheckTData_ok= [];
    var Dose_sug = "";
    var test =[];
    var best =""

    useEffect(() => {
        axios.get('http://tw100038334:7000/speclist')
            .then(function (response) {
                // handle success
                    //console.log(response.data);
                    /*整理從資料庫取出的資料，用json格式儲存*/
                    setSpecList(response.data);   
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                
            })
      },[]);

    /*匯出excel*/
    const downloadExl = () => {

        axios.get('http://tw100038334:7000/speclist')
            .then(function (response) {

                    /*整理從資料庫取出的資料，用json格式儲存*/

                    let datas = response.data//這裡為了不影響專案的資料的使用 採用了lodash中的深克隆方法
                    let json = datas.map(item=> { //將json資料的鍵名更換成匯出時需要的鍵名
                        return {
                            'MODEL' : item.MODEL,
                            'Main': item.Main,
                            'Sub': item.Sub,
                            'MS': item.MS,
                            'Note': item.Note
                        }
                    })
                    download(json,'SpecList.xlsx')//匯出的檔名 
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                
            }) 
    }

    /*匯入excel*/
    const onImportExcel = (files) => {
        // 獲取上傳的文件對象
        //const { files } = file.target; // 通過FileReader對象讀取文件
        const fileReader = new FileReader();
        //console.log(fileReader);
        for (let index = 0; index < files.length; index++) {
            fileReader.name = files[index].name;
        }
        fileReader.onload = event => {
            try {
                // 判斷上傳檔案的類型 可接受的附檔名
                const validExts = [".xlsx", ".xls"];
                const fileExt = event.target.name;

                if (fileExt === null) {
                    alert("檔案為空值");
                }

                const fileExtlastof = fileExt.substring(fileExt.lastIndexOf("."));
                if (validExts.indexOf(fileExtlastof) === -1) {
                    alert("檔案類型錯誤，可接受的副檔名有：" + validExts.toString());
                }

                const { result } = event.target; // 以二進制流方式讀取得到整份excel表格對象
                const workbook = XLSX.read(result, { type: "binary" });
                let data = []; // 存儲獲取到的數據 // 遍歷每張工作表進行讀取（這裡默認只讀取第一張表）
                for (const sheet in workbook.Sheets) {
                    if (workbook.Sheets.hasOwnProperty(sheet)) {
                        // 利用 sheet_to_json 方法將 excel 轉成 json 數據
                        data = data.concat(
                            XLSX.utils.sheet_to_json(workbook.Sheets[sheet])
                        ); // break; // 如果只取第一張表，就取消註釋這行
                    }
                }
                //console.log(data);
                setSpecList(data);

                axios.post('http://tw100038334:7000/speclist/update', {
                    new : data

                })
                    .then(function (response) {

                        //console.log(response);
                            
                    })
                    .catch(function (error) {
                        // handle error
                        console.log(error);
                        
                    })

            } catch (e) {
                // 這裡可以拋出文件類型錯誤不正確的相關提示
                alert(e);
                //console.log("文件類型不正確");
                return;
            }
        }; // 以二進制方式打開文件
        fileReader.readAsArrayBuffer(files[0]);
    };


    /* 讀取SpecList中的Model選項 */
    for(var i = 0; i <SpecList.length  ; i++){
        switch (select) {
            case SpecList[i].MODEL:
                test = SpecList[i];
            break;
            default:
        }
    }
    //console.log(test);

    /* 紀錄選擇Model的選項 */
    const transferValue = (event) => {
        setSelect(event.target.value);
    }



    /* 開始和結束時間相差天數 */
    var DateDiff = function (sDate1, sDate2) { // sDate1 是 2016-06-18 格式
        var oDate1 = new Date(sDate1);
        var oDate2 = new Date(sDate2);
        var iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24); // 把相差的毫秒數轉換為天數
        return iDays;
    };
    
    var GetDateDiff = DateDiff(startDate,endDate); // 轉換為天數 : 1

    /*計算開始天數*/
    const StartDateTime = (dates, dateStrings) =>{
    
        setStartDate(dateStrings);

        
    }

    /*計算結束天數*/
    const EndDateTime = (dates, dateString) =>{
        
        setEndDate(dateString);

        
    }

    /*從資料庫取得PSH資訊*/
    const GetData = (e) => {

        clearForm();//呼叫清除 Dose Setting function
        document.getElementById("selectdata2").options[0].selected = true;
        setSelect(null);
        var sDay = startDate.split("/");
        var eDay = endDate.split("/");
        var sTime = startTime.split(":");
        var eTime = endTime.split(":");
        var Times = parseInt((new Date(sDay[0],sDay[1],sDay[2], sTime[0], sTime[1], 0)  - new Date(eDay[0],eDay[1],eDay[2],eTime[0], eTime[1], 0) ) / 1000 / 60); // 把相差的毫秒數轉換為天數
        //console.log(new Date(0, 0, 0, sTime[0], sTime[1], 0));
       // console.log(Times);

        
        for(var i = 0; i < Data.length ; i++){
            Data.splice(i);
        }
        if(startDate !== "" && endDate !== "" && GetDateDiff < 7 && Times <= 0){
            axios.post('http://tw100038334:7000/predictdata', {

            StartTime: startDate+" "+startTime+":00",
            EndTime: endDate+" "+endTime+":00",

        })
            .then(function (response) {
                // handle success
                let temp = [...Data];
                //console.log(response);
                if(response.data.length === 0){
                    alert("查無資料");
                }else{

                    
                    temp = response.data;
                    setData(temp);

                    const selectGetdata = () => {
                    
                        for(var xx = 0; xx < SpecList.length ; xx++){
                            
                            if(temp[0].product_code === SpecList[xx].MODEL){
    
                                document.getElementById("selectdata2").options[xx+1].selected = true;
                                setSelect(temp[0].product_code);
                            }
                        }
                        
                        
                      }
                    //console.log("PRODUCT_CODE:"+temp[0].PRODUCT_CODE);
                    selectGetdata();
                    

                    
                };
                
                
                

            })
            .catch(function (error) {
                // handle error
                console.log(error);
                
            })
        }else if (GetDateDiff >= 7){
            alert("資料選擇範圍大於7天，請重新選擇");
        }
        else if (Times > 0){
            alert("結束時間不可小於開始時間，請重新選擇");
        }
        else {
            alert("請設定時間!");
        }

        
        
    };


    /* 資料排序 - 根據MS_Pump_Q2進行排序 */
    function sortPR(a,b){
        return b.MS_Pump_Q2-a.MS_Pump_Q2
    }
    Data.sort(sortPR);//將Data排序 
    
    /* Pumping Rate轉換成Film thickness */ 
    function JsonHCL(json,key){
                
        var PR = [];
        var HLC = [];
        var PRkind =[];//Pumping Rate有重複的值
        
        /* 計算Pumping Rate重複的有哪些 */
        for (var j=0,jl=json.length;j < jl;j++) {
            var origin = json[j][key];
            PR.push(origin);
        }
        PRkind = Array.from(new Set(PR));
        

        if(PRkind !== null){
            /* 當有幾種Pumping Rate 分別區分HH、H、C、L、LL */
            switch (PRkind.length) {
                case 1:
                    HLC =["C"];
                    break;
                case 2:
                    HLC = ["C", "L"];
                    break;
                case 3:
                    HLC = ["H", "C", "L"];
                    break;
                case 4:
                    HLC = ["H", "C", "L", "LL"];
                    break;
                case 5:
                    HLC = ["HH", "H", "C", "L", "LL"];
                    break;
                default:
                    HLC ="";
                    break;
            }
        
        }  

        /* 將Film thickness分類放入Data中 */ 
        for (var i=0; i<json.length; i++) {

            switch (json[i].MS_Pump_Q2) {
                case PRkind[0]:
                    json[i].Film_thickness =HLC[0]
                    break;
                case PRkind[1]:
                    json[i].Film_thickness =HLC[1]
                    break;
                case PRkind[2]:
                    json[i].Film_thickness =HLC[2]
                    break;
                case PRkind[3]:
                    json[i].Film_thickness =HLC[3]
                    break;
                case PRkind[4]:
                    json[i].Film_thickness =HLC[4]
                    break;
                default:
                    HLC ="";
                    break;
                
            }
        }
    }

    JsonHCL(Data,'MS_Pump_Q2'); //Pumping Rate轉換成Film thickness

    /* 清除 Dose Setting */ 
    const clearForm = () => {
        //清除input的暫存值
        Array.from(document.querySelectorAll("input")).forEach(
            input => (input.value = "")
          );
        //清除input的暫存值
        for (let s = allDose.length; s > 0; s--) {
            allDose.pop();
          }
        //console.log("delect"+allDose);
        
      }
      


    /*儲存Setting Dose的值*/
    const Save_Dose = (e, index) => {

        //console.log(e);
        allDose[index]=e;//儲存所有值
        //const newData = Data;
        let newData= [...Data];
        newData[index].DOSE_SETTING = e;
        setData(newData)//儲存到Data中
        //console.log(newData);
        
    };
    //console.log(allDose);


    


    function check3_Data_input(json,key){

        var HH =[];
        var H =[];
        var C =[];
        var L =[];
        var LL =[];

        for (var i=0; i<json.length; i++) {

        switch (json[i][key]) {
            case "HH":
                HH.push(json[i]);
                Rank_HH.push(json[i]);
                break;
            case "H":
                H.push(json[i]);
                Rank_H.push(json[i]);
                break;
            case "C":
                C.push(json[i]);
                Rank_C.push(json[i]);
                break;
            case "L":
                L.push(json[i]);
                Rank_L.push(json[i]);
                break;
            case "LL":
                LL.push(json[i]);
                Rank_LL.push(json[i]);
                break;
            default:
                break;
                
        }
    }

    check3Data.push(HH,H,C,L,LL);

    function sortRank(a,b){
        return b.psh_Gap_xgb_pred-a.psh_Gap_xgb_pred
    }


    
    Rank_HH.sort(sortRank);
    Rank_H.sort(sortRank);
    Rank_C.sort(sortRank);
    Rank_L.sort(sortRank);
    Rank_LL.sort(sortRank);
    
    check3Data_Rank.push(Rank_HH,Rank_H,Rank_C,Rank_L,Rank_LL);

    }
    check3_Data_input(Data,'Film_thickness');

    //console.log(check3Data_Rank);
    

    function check3_judge(json,key){
        const check3_all =[];
        let y = 0;
        let x = 0;
        let t = 0;
        let k = 0;
        let z = 0;
        
        //console.log(check3Data_Rank[1]);

        while(y < json[0].length){
            
          
          if(json[0][y].DOSE_SETTING !== ""){
            if(y === (json[0].length)-1){
              json[0][y].linearity = "TRUE";
            }else if(Number(json[0][y].psh_Gap_xgb_pred) > Number(json[0][y+1].psh_Gap_xgb_pred) && Number(json[0][y].DOSE_SETTING) <= Number(json[0][y+1].DOSE_SETTING)){
              json[0][y].linearity = "TRUE"
            }else{
              json[0][y].linearity ="FALSE";
            }
          }else{
            json[0][y].linearity ="";
          }
      
          if(y === (json[0].length)-1){
            break;
          }
          
          y+=1;
          
        }
    
        
        while(x < json[1].length){
          
          if(json[1][x].DOSE_SETTING !== ""){

            if(x === (json[1].length)-1){
 
                json[1][x].linearity = "TRUE";
            }else if(Number(json[1][x].psh_Gap_xgb_pred) > Number(json[1][x+1].psh_Gap_xgb_pred) && Number(json[1][x].DOSE_SETTING) <= Number(json[1][x+1].DOSE_SETTING)){
     
                json[1][x].linearity = "TRUE"
            }else{
     
              json[1][x].linearity ="FALSE";
            }
          }else{
 
            json[1][x].linearity ="FALSE";
          }
      
          if(x === (json[1].length)-1){
            break;
          }

          
          x+=1;
          
        }
      
        
        while(t < json[2].length){
          
          if(json[2][t].DOSE_SETTING !== ""){
            if(t === (json[2].length)-1){
              json[2][t].linearity = "TRUE";
            }else if(Number(json[2][t].psh_Gap_xgb_pred)>Number(json[2][t+1].psh_Gap_xgb_pred) && Number(json[2][t].DOSE_SETTING) <= Number(json[2][t+1].DOSE_SETTING)){
              json[2][t].linearity = "TRUE"
            }else{
              json[2][t].linearity ="FALSE";
            }
          }else{
            json[2][t].linearity ="FALSE";
          }
      
          if(t === (json[2].length)-1){
            break;
          }
          
          t+=1;
        }
      
        while(k < json[3].length){
      
          
          if(json[3][k].DOSE_SETTING !== ""){
            if(k === (json[3].length)-1){
              json[3][k].linearity = "TRUE";
            }else if(Number(json[3][k].psh_Gap_xgb_pred) > Number(json[3][k+1].psh_Gap_xgb_pred) && Number(json[3][k].DOSE_SETTING) <= Number(json[3][k+1].DOSE_SETTING)){
              json[3][k].linearity = "TRUE"
            }else{
              json[3][k].linearity ="FALSE";
            }
          }else{
            json[3][k].linearity ="FALSE";
          }
      
          if(k === (json[3].length)-1){
            break;
          }
          
          k+=1;
        }
        while(z < json[4].length){
          
          if(json[4][z].DOSE_SETTING !== ""){
            if(z === (json[4].length)-1){
              json[4][z].linearity = "TRUE";
            }else if(Number(json[4][z].psh_Gap_xgb_pred) > Number(json[4][z+1].psh_Gap_xgb_pred) && Number(json[4][z].DOSE_SETTING) <= Number(json[4][z+1].DOSE_SETTING)){
              json[4][z].linearity = "TRUE"
            }else{
              json[4][z].linearity ="FALSE";
    
            }
          }else{
            json[4][z].linearity ="FALSE";
    
          }
      
          if(z === (json[4].length)-1){
            break;
          }
          
          z+=1;
        }
    
        for(var w=0; w<json.length;w++){
            /* 計算重複的值有哪些 */
            for (var c=0,cl=json[w].length;c < cl;c++) {
                    
                var origin = json[w][c].linearity
                check3_all.push(origin);
            }
        }
        
        check3kind = Array.from(new Set(check3_all));
    
      
      }

    check3_judge(check3Data_Rank,'DOSE_SETTING');
    //console.log(check3kind);
    //console.log(check3Data_Rank);


    function check4_judge(json,key){

        check4dose = Array.from(new Set(allDose));

        function sortcheck4dose(a,b){
            return b-a
        }

        for(var i = 0; i<check4dose.length;i++){
            check4dose_Rank.push(check4dose[i])
        }
        
        check4dose_Rank.sort(sortcheck4dose);

        for(var s=0; s<check4dose_Rank.length; s++){
        
            let  a_all = [];
            for (var j=0; j<json.length; j++) {
            
                if(check4dose_Rank[s] === json[j].DOSE_SETTING  ){
                    let a = Number(json[j].psh_Gap_xgb_pred);
                    a_all.push(a); 
                    
                }
            
            }
            //console.log("aa"+check4Data)

            let sum = a_all.reduce((previous, current) => current += previous, 0);
            let avg = Math.round((sum / a_all.length) * 1000) / 1000
            check4Data_avg.push(avg);
            check4Data_avgRank.push(avg);
        
            check4Data.push(a_all)

        }


        let x = 0;
        while(x < check4dose_Rank.length){
        
            if(check4dose_Rank !== ""){
                if(x === (check4dose_Rank.length)-1){
                check4_TF[x] = "TRUE";
                }else if(Number(check4dose_Rank[x]) > Number(check4dose_Rank[x+1]) && Number(check4Data_avgRank[x]) < Number(check4Data_avgRank[x+1])){
                check4_TF[x] = "TRUE"
                }else{
                check4_TF[x] ="FALSE";
                }
            }else{
                check4_TF[x] ="FALSE";
                //console.log("no")
            }
        
            if(x === (check4dose_Rank.length)-1){
                break;
        }
        
            x+=1;
        }
        check4kind = Array.from(new Set(check4_TF));
        //console.log(check4kind);

    }
    check4_judge(Data,"DOSE_SETTING");


    //R_dose_thinkness_correction
    function R_dose_thinkness_correction(json,key){

        
        for(var i = 0; i < json.length; i++){
            if(json[i].DOSE_SETTING  !== ""){

                json[i].dose_thinkness= Math.round(((Number(json[i][key])-Number(test.MS))*100)+Number(json[i].DOSE_SETTING));

            }else{ 

                json[i].dose_thinkness="";

            }
        }
        
        
        for(var j = 0; j < json.length; j++){
            //console.log(json[j].psh_main_xbg_pred);
            //console.log(test.Main);
            if(Number(json[j].psh_main_xbg_pred) >= (Number(test.Main)-0.03) && Number(json[j].psh_main_xbg_pred) <= (Number(test.Main)+0.03)){

                var ss = {
                    psh_main_xbg_pred : json[j].psh_main_xbg_pred,
                    psh_sub_xgb_pred : json[j].psh_sub_xgb_pred,
                    psh_Gap_xgb_pred : json[j].psh_Gap_xgb_pred,
                    Gap_Avg : json[j].Gap_Avg,
                    DOSE_SETTING:json[j].DOSE_SETTING,
                    dose_thinkness: "",

                    
                };
                CheckTData_ok.push(ss);
                //console.log(Data[j].DOSE_SETTING);
                if(CheckTData_ok[j].DOSE_SETTING  === "" ){
                    CheckTData_ok[j].dose_thinkness ="";

                }else{ 
                    CheckTData_ok[j].dose_thinkness = Math.round(((Number(CheckTData_ok[j][key])-Number(test.MS))*100)+Number(CheckTData_ok[j].DOSE_SETTING));
    
                }
                
    
            }else{
                var vv = {
                    check :"no"
                };
                CheckTData_ok.push(vv);
            }

            
        }
        
    }
    R_dose_thinkness_correction(Data,'psh_Gap_xgb_pred');
    //console.log(CheckTData_ok)
   
    

    /* M-S條件最適值 */
    function BestMS(json,key){
            
        var MS = [];
        
        /* 將所有M-S列出 */
        for (var j=0; j < json.length; j++) {
            if(json[j][key] === undefined){
                var origin = 0
                MS.push(origin);
            }else{
                origin = json[j][key];
                MS.push(origin);
            }
            
        }
        //console.log(MS)

        best = MS[0];
        //console.log(best)
        /* 找出與M-S規格最相近的值 */
        var distance = Math.abs(best - Number(test.MS));
        for(var i = 1; i < MS.length; i++){
            var newDistance = Math.abs(MS[i] - Number(test.MS));
            if(newDistance < distance){
                distance = newDistance;
                best = MS[i];
            }
        }
        return best;
        
    }
    /*
    if(test.MS !== undefined){
        BestMS(CheckTData_ok,'psh_Gap_xgb_pred'); //M-S條件最適值
    }
*/
    BestMS(CheckTData_ok,'psh_Gap_xgb_pred'); //M-S條件最適值
    

    /* 最適值的Dose值 */
    function BestMS_DOSE(json,key){

        for(var i = 0; i < json.length; i++){
            
            if(best === json[i].psh_Gap_xgb_pred){
                dose = json[i][key];
                
            }
        }
        return dose;    
    }
    BestMS_DOSE(Data,'DOSE_SETTING');


    

    //console.log("dose"+dose);

    
    /* 將dose值相同放入check2Data */
    function check2_Data_input(json,key){

        for(var j = 0; j < json.length; j++){
            
            //console.log(json[j][key]);
            //console.log(dose);

            if(dose !== undefined && dose !== "" && dose === json[j][key]   ){
            
                var dd = json[j]
                check2Data.push(dd);
            }
            
        }
        
    }
    check2_Data_input(Data,'DOSE_SETTING');
    //console.log(check2Data);

    //判斷CHECK2
    function best_same_DOSE(json,key){

        //最適值相同曝光量 M-S :相同曝光量不同模厚與M-S差都在0.04規格內

        for(var j = 0; j < json.length; j++){
            //console.log(test);
            if(Number(json[j][key]) > (Number(test.MS) - 0.04) && Number(json[j][key]) < (Number(test.MS) + 0.04)){
                
                json[j].best_DOSE = "TRUE"
            }else{
                json[j].best_DOSE = "FALSE"
            }
            
        }
        
        //console.log(json);
        /* 計算best_same_DOSE_all有重複的值有哪些 */
        for (var i=0,il=json.length;i < il;i++) {
            
            var origin = json[i].best_DOSE
            //console.log("okok"+origin);
            best_same_DOSE_all.push(origin);
        }
       
        check2kindT = 0;
        check2kindF = 0;

        for(var p=0; p < best_same_DOSE_all.length;p++){
            if(best_same_DOSE_all[p] === "TRUE"){

                check2kindT = check2kindT + 1;
            }else if(best_same_DOSE_all[p] === "FALSE"){
                check2kindF = check2kindF + 1;
            }
        }
        
        check2kind = Array.from(new Set(best_same_DOSE_all));
        //console.log("tttt"+check2kind);

        
    }
    best_same_DOSE(check2Data,'psh_Gap_xgb_pred');


    //console.log("best"+best);

    //best_R_dose_thinkness_correction
    function best_R_dose_thinkness_correction(json,key){
        //console.log(CheckTData_ok);

        for(var x = 0; x < json.length; x++){
            if(best === json[x][key]){
                Dose_sug = json[x].dose_thinkness;

            }
            else{
                //console.log("uuuu");
            }
        }
        
    }
    best_R_dose_thinkness_correction(CheckTData_ok,'psh_Gap_xgb_pred');
    
    //console.log("Dose_sug"+Dose_sug);

    /* check1 : 最適值 */
    var check1_best = Math.abs(Number(test.MS)-Number(best));

    if(check1_best <= 0.03){
        check1="OK";
    }else if(check1_best > 0.03){
        check1="NG"
    }
    else{
        check1=""
    }



    //check2 : 最適值 
    //console.log(check2kind);

    if(check2kindT=== 0 && check2kindF === 0){
        check2="NG"
    }else{
        if(check2kindT === 1){
            check2="Only One"
        }else{
            if(check2kind.length === 1){
                if(check2kind[0] === "TRUE"){
    
                    check2="OK";
                }else if(check2kind[0] === "FALSE"){
                    check2="NG"
                }else{
                    check2=""
                }
                
            }else if(check2kind.length === 2){
                check2="NG"
            }else{
                check2=""
            }
        }
    }



    //check3 : 
    if(check3kind.length === 1){
        if(check3kind[0] === "TRUE"){
            check3="OK";
        }else if(check3kind[0] === "FALSE"){
            check3="NG";
        }else{
            check3="";
        }
        
    }else if(check3kind.length === 2){
        check3="NG";
    }else{
        check3="";
    }


    //console.log(allDose.length+"="+Data.length)
    function count_setAllDoseSetting (json,key){
        
        //let setting =[...allDoseSetting];
        let all = [...allDoseSetting];
        for(var ff =0 ; ff < json.length ;ff++ ){
            //console.log(json[ff][key]);
            if(json[ff][key] !== ""){
                var Setting = json[ff][key];
                all.push(Setting);
            }else{

                
            }
            
        }

        //check4 : 
        if(allDose.length !== Data.length || all.length !== Data.length){
            check4 = "Key in Dose"
        }else{

            if(check4kind.length === 1){
                if(check4kind[0] === "TRUE"){
                    check4="OK";
                }else if(check3kind[0] === "FALSE"){
                    check4="NG";
                }else{
                    check4="";
                }
            
            }else if(check4kind.length === 2){
                check4="NG";
            }else{
                check4="";
            }
        }

    }

    count_setAllDoseSetting(Data,'DOSE_SETTING');


    if(test.Note !== "" && test.Note !== "undefined"){
        Check_Note = test.Note;
    }else{
        Check_Note = "未輸入注意事項";
    }
    

    //
    if(check1 === "OK" && check2 === "OK" && check3 === "OK" && check4 === "OK"){
        Run ="開Run條件OK";
        Run_Note ="check1 ~ check4條件符合";
    }else if(check1 === "OK" && check2 === "Only One" && check3 === "OK" && check4 === "OK"){
        Run ="開Run條件OK";
        Run_Note ="check1 ~ check4條件符合";
    }else if(check1 === "OK" && check2 === "OK" && check3 === "NG" && check4 === "OK"){
        Run ="Risk Run";
        Run_Note ="check1 & 2 & 4 OK , check3 NG";
    }else if(check1 === "OK" && check2 === "OK" && check3 === "OK" && check4 === "NG"){
        Run ="Risk Run";
        Run_Note ="check1 & 2 & 3 OK , check4 NG";
    }else{
        Run ="請再打一輪條件";
        Run_Note ="叫線上趕快放片";
    }


    /* check form 表格顏色 */
    const getColor_Check = (check) => {
        if (check === "NG" || check ==="Key in Dose") return '#F5C9CA';
        if (check === "OK" || check === "Only One" ) return '#AAD4EC';
        if (check === "") return '	#9D9D9D';
        return '';
    };


    const getColor = (check) => {
        if (Run === "Risk Run" || Run ==="請再打一輪條件") return '#FFBD9D';
        if (Run ==="開Run條件OK") return '#AAD4EC';
        if (Run === "") return '	#9D9D9D';
        return '';
    };

    const getColor_main = (index) => {
        
        if(Number(Data[index].psh_main_xbg_pred) < (Number(test.Main)-0.03) || Number(Data[index].psh_main_xbg_pred) > (Number(test.Main)+0.03)) return '#F5C9CA';
        //if(Number(Data[index].psh_main_xbg_pred) >= (Number(test.Main)-0.03) && Number(Data[index].psh_main_xbg_pred) <= (Number(test.Main)+0.03)) return '#AAD4EC';
        return '';
        
    };
    //console.log("uu"+best);

    
    return (
     
            <div id="wrapper">
            
                <div id="main" >
                    <div class="inner">

                        <h1 style={{ color : '#F5A429' }}><b>PSH VM 輔 助 決 策 系 統</b></h1>
                        <div className = 'data-vm'>
            
                            <img src={Logo} width="10%" height="10%" className = 'logo' alt="logo"/>

                            <div className = 'datetime'>
                                <Form.Label >Time :</Form.Label><br></br>

                                <DatePicker 
                                    className = 'ant-class'
                                    size = "large" 
                                    format="YYYY/MM/DD"
                                    defaultOpenValue={moment('0000/00/00', 'YYYY/MM/DD')} 
                                    onChange={StartDateTime}
                                />

                                <TimePicker
                                    className = 'ant-class'
                                    size = "large" 
                                    format="HH:mm"
                                    showNow={false}
                                    value={moment(startTime, "HH:mm")}
                                    onSelect={(value) => {
                                        const timeString = moment(value).format("HH:mm");
                                        setStartTime(timeString);
                                    }} 
                                />

                                <b className = 'to'> → </b>

                                <DatePicker 
                                    className = 'ant-class'
                                    size = "large"
                                    format="YYYY/MM/DD" 
                                    defaultOpenValue={moment('0000/00/00', 'YYYY/MM/DD')} 
                                    onChange={EndDateTime}
                                />

                                <TimePicker
                                    className = 'ant-class'
                                    size = "large" 
                                    format="HH:mm"
                                    showNow={false}
                                    value={moment(endTime, "HH:mm")}
                                    onSelect={(value) => {
                                    const timeString = moment(value).format("HH:mm");
                                    setEndTime(timeString);
                                    
                                }} />

                                
                                
                            </div>
                            <div className = 'getdata'>
                                <button className="btn-vm-get" onClick={GetData} >GetData</button>
                                
                            </div>
                            
                        </div>
                                    
                        <div className = 'decision' >
                            <table className="table table-bordered">
                            
                                <tbody >
                                
                                    <tr>
                                        <th className="table-light">Model</th>
                                        <td >
                                            <Form.Select 
                                                id="selectdata2"
                                                defaultValue={''}
                                                type="text" 
                                                style={{ width: '90%' }}
                                                onChange={transferValue}>
                                                    <option value="" disabled>Select One</option>
                                                    {SpecList.map((specList, index)=>{
                                                    return <option key={"specList"+index} value={specList.MODEL}>{specList.MODEL}</option>
                                                })}
                                                
                                            </Form.Select>
                                        </td>
                                        <th colSpan="2" className="table-light" >SpecList</th>
                                        <th className="table-light">check1</th>
                                        <th className="table-light" colSpan="3">最適值</th>
                                        <td >±</td>
                                        <td>0.03</td>
                                        <td style={{ background: getColor_Check(check1) }}>{check1}</td>
                                    
                                    </tr>
                                    <tr>
                                        <th className="table-light">M-S規格</th>
                                        <td >{Math.round(Number(test.MS) * 100) / 100}</td>
                                        <td colSpan="2">
                                            <button className="btn-vm-down" onClick={downloadExl}>下載</button>
                                            <InputFiles accept=".xlsx, .xls" onChange={onImportExcel}>
                                                <button className="btn-vm-save">匯入</button>
                                            </InputFiles>
                                        </td>
                                        <th className="table-light">check2</th>
                                        <th className="table-light" colSpan="3">最適值相同曝光量 M-S</th>
                                        <td >±</td>
                                        <td >0.04</td>
                                        <td style={{ background: getColor_Check(check2) }}>{check2}</td>
                                    </tr>
                                    <tr>
                                        <th className="table-light">M-S條件最適值</th>
                                        <td >{Math.round(best * 1000) / 1000}</td>
                                        <td colSpan="2"></td>
                                        <th className="table-light">check3</th>
                                        <th className="table-light" colSpan="5">同膜厚不同曝光量線性</th>
                                        <td style={{ background: getColor_Check(check3) }}>{check3}</td>
                                    </tr>
                                    <tr>
                                        <th className="table-light">復線Dose建議值</th>
                                        <td >{Dose_sug}</td>
                                        <td colSpan="2"></td>
                                        <th className="table-light">check4</th>
                                        <th className="table-light" colSpan="5">相同曝光量平均值線性</th>
                                        <td style={{ background: getColor_Check(check4) ,width:"8%"}}>{check4}</td>
                                    </tr>
                                    <tr>

                                        <th style={{ background: getColor(Run) }} colSpan="3">{Run}</th>
                                        <th style={{ background: getColor(Run) }}>{Run_Note}</th>
                                        <th style={atStyle}>注意事項</th>
                                        <th style={atStyle} colSpan="6">{Check_Note}</th>
                                    </tr>
                                </tbody>
                        
                            </table>
                        </div>

        
                        <div className = 'check1' >
                            <table  className="table table-bordered table-hover" >
                                <thead >
                                    <tr className="table-light">
                                        <th colSpan="3" >實驗Data</th>
                                        <th >Coater</th>
                                        <th>Main</th>
                                        <th>Sub</th>
                                        <th >M-S</th>
                                        <th rowSpan="2">
                                            Dose<br />Setting
                                        </th>
                                        <th rowSpan="2">Dose<br />Real</th>
                                        <th rowSpan="2">Gap<br />Real</th>
                                        <th>段差最適值</th>
                                    
                                    </tr>
                                    <tr className="table-light">
                                        <th>No.</th>
                                        <th>Glass ID</th>
                                        <th>Film thickness<br />(HH/H/C/L/LL)<br />必須符合以上</th>
                                        <th>Pumping rate</th>
                                        <th>{test.Main}</th>
                                        <th>{test.Sub}</th>
                                        <th>{Math.round(Number(test.MS) * 100) / 100}</th>
                                        <th>建議曝光量<br />膜厚補正</th>
                                    </tr>
                                </thead>
                            
                                <tbody>
                                    {Data.map((data, index )=>{
                                        return <tr key={"table"+index}>
                                            <td>{index+1}</td>
                                            <td>{data.sheet_id}</td>
                                            <td>{data.Film_thickness}</td>
                                            <td>{data.MS_Pump_Q2}</td>
                                            <td style={{ background: getColor_main(index)}}>{Math.round(data.psh_main_xbg_pred * 1000) / 1000}</td>
                                            <td>{Math.round(data.psh_sub_xgb_pred * 1000) / 1000}</td>
                                            <td>{Math.round(data.psh_Gap_xgb_pred * 1000) / 1000}</td>
                                            <td><input type="text" className = 'input' key={index} value={allDose.index} onChange={(e) => Save_Dose(e.target.value, index)}></input></td>
                                            <td>{Math.round(data.Dose)}</td>
                                            <td>{Math.round(data.Gap_Avg)}</td>
                                            <td>{data.dose_thinkness}</td>

                                        </tr>
                                        
                                    })}
                                    
                                </tbody>
                        
                        
                                
                        
                            </table>
                            
                        </div>

                        <Tabs
                            //id="controlled-tab-example"
                            //activeKey={key}
                            //onSelect={(k) => setKey(k)}
                            className="mb-3"
                            //color='red'
                        >
                            <Tab eventKey="check2" title="Check2">
                                <VMcheck2 data={ check2Data } model={ test } best ={best}/>
                            </Tab>
                            <Tab eventKey="check3" title="Check3" >
                                <VMcheck3 data={ check3Data } model={ test } best ={best} rank={check3Data_Rank}/>
                            </Tab>
                            <Tab eventKey="check4" title="Check4">
                                <VMcheck4 
                                    data={ check4Data } 
                                    check4Data_avg={ check4Data_avg } 
                                    check4Data_avgRank ={check4Data_avgRank} 
                                    check4dose={check4dose} 
                                    check4dose_Rank={check4dose_Rank}
                                    check4_TF={check4_TF}
                                />
                            </Tab>
                            <Tab eventKey="checkThinkness" title="Check模厚">
                                <VMcheckThinkness data={ Data } model={ test } ok={CheckTData_ok} />
                            
                            </Tab>

                            
                        </Tabs>
                        

                    </div>

                </div>


                
            </div>

    );
};


export default Predict;



