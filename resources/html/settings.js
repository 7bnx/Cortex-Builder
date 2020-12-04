

let root = document.documentElement;

var currentTab = 'General';
const vscode = acquireVsCodeApi();

window.addEventListener("load", () => {
  currentTab = 'Target';
  selectorWidth = document.getElementById('tabLinkTarget').getBoundingClientRect().width.toString() + "px";
  selectorLeftMargin = (document.getElementById('tabLinkGeneral').getBoundingClientRect().width + 4.5).toString() + "px";
	root.style.setProperty('--selectorWidth', selectorWidth);
	root.style.setProperty('--selectorLeftMargin', selectorLeftMargin);
  document.getElementById('tabTarget').style.display = 'block';
});

window.addEventListener('message', event => {
  const message = event.data;
  switch(message.command){
    case 'setSettings':
      commandSetSettings(message.data);
      break;
    case 'setCompilerPath':
      document.getElementById('inputCompilerPath').value = message.data;
      break;
    case 'setOpenOCDPath':
      document.getElementById('inputOpenOCDPath').value = message.data;
    break;
  }
});

function commandSetSettings(data){
  autocomplete(document.getElementById("inputSelectedController"), data.controllers);
  var select = document.getElementsByClassName("select-selected");
  select[0].textContent = data.settings.standardCPP;
  select[1].textContent = data.settings.standardC;
  select[2].textContent = data.settings.optimization;
  select[3].textContent = data.settings.projectType;
  //  select[4].textContent = //startup type
  select[5].textContent = data.settings.servertype;
  select[6].textContent = data.settings.debugger;
  if (data.settings.servertype === 'jlink'){
    document.getElementsByClassName("debugTool")[0].style.display = "none";
  }
  let str = "";
  data.settings.defines.forEach(element => {
    str += element + ';';
  });
  document.getElementById('inputDefines').value = str;
  str = "";

  data.settings.flagsC.forEach(element => {
    str += element + ';';
  });
  document.getElementById('inputFlagsC').value = str;
  str = "";

  data.settings.flagsCPP.forEach(element => {
    str += element + ';';
  });
  document.getElementById('inputFlagsCPP').value = str;
  str = "";

  data.settings.flagsASM.forEach(element => {
    str += element + ';';
  });
  document.getElementById('inputFlagsASM').value = str;
  str = "";

  document.getElementById('inputSelectedController').value = data.settings.controller;
  document.getElementById('inputFlashStart').value = data.settings.flashStart;
  document.getElementById('inputStackSize').value = data.settings.stackSize;
  document.getElementById('inputHeapSize').value = data.settings.heapSize;
  document.getElementById('inputCompilerPath').value = data.general.compilerPath;
  document.getElementById('inputOpenOCDPath').value = data.general.openOCDPath;
}

window.addEventListener("resize", function(){
	var selectorLeftMargin = '0px';
	var selectorWidth = '0px';
	if (currentTab === 'General'){
		selectorWidth = document.getElementById('tabLinkGeneral').getBoundingClientRect().width.toString() + "px";
	} else if (currentTab === 'Target'){
		selectorWidth = document.getElementById('tabLinkTarget').getBoundingClientRect().width.toString() + "px";
		selectorLeftMargin = (document.getElementById('tabLinkGeneral').getBoundingClientRect().width + 4.5).toString() + "px";
	} else if (currentTab === 'CCPP'){
		selectorWidth = document.getElementById('tabLinkCCPP').getBoundingClientRect().width.toString() + "px";
    selectorLeftMargin = (document.getElementById('tabLinkGeneral').getBoundingClientRect().width + 
                          document.getElementById('tabLinkTarget').getBoundingClientRect().width + 4.5).toString() + "px";
  } else if (currentTab === 'Debug'){
		selectorWidth = document.getElementById('tabLinkCCPP').getBoundingClientRect().width.toString() + "px";
    selectorLeftMargin = (document.getElementById('tabLinkGeneral').getBoundingClientRect().width + 
                          document.getElementById('tabLinkTarget').getBoundingClientRect().width + 
                          document.getElementById('tabLinkCCPP').getBoundingClientRect().width + 13.5).toString() + "px";
	}
	root.style.setProperty('--selectorWidth', selectorWidth);
	root.style.setProperty('--selectorLeftMargin', selectorLeftMargin);
}, true);

function openTab(evt, tab) {
	var selectorLeftMargin = '0px';
	var selectorWidth = '0px';
	if (tab === 'tabGeneral'){
    currentTab = 'General';
		selectorWidth = document.getElementById('tabLinkGeneral').getBoundingClientRect().width.toString() + "px";
	} else 	if (tab === 'tabTarget'){
    currentTab = 'Target';
		selectorWidth = document.getElementById('tabLinkTarget').getBoundingClientRect().width.toString() + "px";
		selectorLeftMargin = (document.getElementById('tabLinkGeneral').getBoundingClientRect().width + 4.5).toString() + "px";
  } else 	if (tab === 'tabCCPP'){
    currentTab = 'CCPP';
		selectorWidth = document.getElementById('tabLinkCCPP').getBoundingClientRect().width.toString() + "px";
    selectorLeftMargin = (document.getElementById('tabLinkGeneral').getBoundingClientRect().width + 
                          document.getElementById('tabLinkTarget').getBoundingClientRect().width + 4.5).toString() + "px";
  }else 	if (tab === 'tabDebug'){
    currentTab = 'Debug';
		selectorWidth = document.getElementById('tabLinkCCPP').getBoundingClientRect().width.toString() + "px";
    selectorLeftMargin = (document.getElementById('tabLinkGeneral').getBoundingClientRect().width + 
                          document.getElementById('tabLinkTarget').getBoundingClientRect().width + 
                          document.getElementById('tabLinkCCPP').getBoundingClientRect().width + 13.5).toString() + "px";
  }
  

	root.style.setProperty('--selectorWidth', selectorWidth);
	root.style.setProperty('--selectorLeftMargin', selectorLeftMargin);
	
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabContent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tabLinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tab).style.display = "block";
	evt.currentTarget.className += " active";
}



function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
			a.setAttribute("class", "autocomplete-items");
			a.style.height = "100px";
			a.style.scrollBehavior = "smooth";
			a.style.overflowY = "scroll";
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      let h = 0;
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].substr(0, val.length).toUpperCase() === val.toUpperCase()) {
          h++;
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
              b.addEventListener("click", function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
          });
          a.appendChild(b);
        }
      }
      if (h > 10){h = 10;}
      a.style.height = (h*15).toString() + 'pt';
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x){ x = x.getElementsByTagName("div");}
      if (e.keyCode === 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode === 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode === 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x){ x[currentFocus].click();}
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x){ return false;}
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length){ currentFocus = 0;}
    if (currentFocus < 0){ currentFocus = (x.length - 1);}
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt !== x[i] && elmnt !== inp) {
      x[i].parentNode.removeChild(x[i]);
    }
  }
}
/*execute a function when someone clicks in the document:*/
document.addEventListener("click", function (e) {
    closeAllLists(e.target);
});
}

function customSelect(){
  var x, i, j, l, ll, selElmnt, a, b, c;
  /* Look for any elements with the class "custom-select": */
  x = document.getElementsByClassName("custom-select");
  l = x.length;
  for (i = 0; i < l; i++) {
    selElmnt = x[i].getElementsByTagName("select")[0];
    ll = selElmnt.length;
    /* For each element, create a new DIV that will act as the selected item: */
    a = document.createElement("DIV");
    a.setAttribute("class", "select-selected");
    a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
    x[i].appendChild(a);
    /* For each element, create a new DIV that will contain the option list: */
    b = document.createElement("DIV");
    b.setAttribute("class", "select-items select-hide");
    for (j = 1; j < ll; j++) {
      /* For each option in the original select element,
      create a new DIV that will act as an option item: */
      c = document.createElement("DIV");
      c.innerHTML = selElmnt.options[j].innerHTML;
      c.addEventListener("click", function(e) {
          /* When an item is clicked, update the original select box,
          and the selected item: */
          var y, i, k, s, h, sl, yl;
          s = this.parentNode.parentNode.getElementsByTagName("select")[0];
          sl = s.length;
          h = this.parentNode.previousSibling;
          for (i = 0; i < sl; i++) {
            if (s.options[i].innerHTML === this.innerHTML) {
              s.selectedIndex = i;
              h.innerHTML = this.innerHTML;
              y = this.parentNode.getElementsByClassName("same-as-selected");
              yl = y.length;
              for (k = 0; k < yl; k++) {
                y[k].removeAttribute("class");
              }
              this.setAttribute("class", "same-as-selected");
              break;
            }
          }
          h.click();
          if (document.getElementsByClassName("select-selected")[5].textContent === 'jlink'){
            document.getElementsByClassName("debugTool")[0].style.display = "none";
          } else {
            document.getElementsByClassName("debugTool")[0].style.display = "block";
          }
      });
      b.appendChild(c);
    }
    x[i].appendChild(b);
    a.addEventListener("click", function(e) {
      /* When the select box is clicked, close any other select boxes,
      and open/close the current select box: */
      e.stopPropagation();
      closeAllSelect(this);
      this.nextSibling.classList.toggle("select-hide");
      this.classList.toggle("select-arrow-active");
    });
    
  }

  function closeAllSelect(elmnt) {
    /* A function that will close all select boxes in the document,
    except the current select box: */
    var x, y, i, xl, yl, arrNo = [];
    x = document.getElementsByClassName("select-items");
    y = document.getElementsByClassName("select-selected");
    xl = x.length;
    yl = y.length;
    for (i = 0; i < yl; i++) {
      if (elmnt === y[i]) {
        arrNo.push(i);
      } else {
        y[i].classList.remove("select-arrow-active");
      }
    }
    for (i = 0; i < xl; i++) {
      if (arrNo.indexOf(i)) {
        x[i].classList.add("select-hide");
      }
    }
  }
  
  /* If the user clicks anywhere outside the select box,
  then close all select boxes: */
  document.addEventListener("click", closeAllSelect);
}


function setCompilerPath(){
  vscode.postMessage({
    command: 'setCompilerPath',
  });
}

function setOpenOCDPath(){
  vscode.postMessage({
    command: 'setOpenOCDPath',
  });
}

function buttonSave_Click(){
  vscode.postMessage({
    command: 'setSettings',     
    controller:   document.getElementById('inputSelectedController').value,
    flashStart:   document.getElementById('inputFlashStart').value,
    stackSize:    document.getElementById('inputStackSize').value,
    heapSize:     document.getElementById('inputHeapSize').value,
    standardCPP:  document.getElementsByClassName("select-selected")[0].textContent,
    standardC:    document.getElementsByClassName("select-selected")[1].textContent,
    optimization: document.getElementsByClassName("select-selected")[2].textContent,
    projectType:  document.getElementsByClassName("select-selected")[3].textContent,
    startupType:  document.getElementsByClassName("select-selected")[4].textContent,
    servertype:   document.getElementsByClassName("select-selected")[5].textContent,
    debugger:     document.getElementsByClassName("select-selected")[6].textContent,
    defines:      document.getElementById('inputDefines').value.replace(' ','').split(';').filter(e=>e),
    flagsASM :    document.getElementById('inputFlagsASM').value.replace(' ','').split(';').filter(e=>e),
    flagsC:       document.getElementById('inputFlagsC').value.replace(' ','').split(';').filter(e=>e),
    flagsCPP:     document.getElementById('inputFlagsCPP').value.replace(' ','').split(';').filter(e=>e),
    compilerPath: document.getElementById('inputCompilerPath').value,
    openOCDPath:  document.getElementById('inputOpenOCDPath').value
  });
  return;
}