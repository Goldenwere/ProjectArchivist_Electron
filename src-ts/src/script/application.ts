import $ from 'jquery';
import * as Electron from "electron";
import { writeScript } from '~/util';
import { ArchivedItem } from '~/classes';

enum ListElementChildTags {
  start = "<listelem>",
  close = "</listelem>"
}

let mainPage: JQuery<HTMLElement>;
let itemPage: JQuery<HTMLElement>;
let exclPage: JQuery<HTMLElement>;
let items: ArchivedItem[];
let workingExclusions: string[];
let workingRecursives: boolean[];
let workingIndexItem: number;
let workingIndexExcl: number;

$(document).ready(function() {
  mainPage = $("#Page_Main");
  itemPage = $("#Page_Item");
  exclPage = $("#Page_Excl");

  mainPage.toggleClass("current-page");
  workingIndexItem = 0;
  workingIndexExcl = 0;
  items = [];

  handleWindowButtons();
  handleItemEditorFields();
});

/*
** Setup function - all buttons that in some way change page states in the window (add, edit, save/exit)
** Because they are grouped with add/edit, remove buttons are also in here, though they don't necessarily change the entire page
*/
function handleWindowButtons() {
  $("#Button_Archiving_CreateScript").click(function() {
    if (validateMainFields()) {
      writeScript(items, <string>$("#Field_FileSettings_SavePath").val());
    }
  });

  $("#Button_ListItems_Add").click(function() {
    switchToFromItemPage();
    fillItemFields(false);
    workingIndexItem = items.length;

    // New items mean that the working exclusions set needs reset
    workingIndexExcl = 0;
    workingExclusions = [];
    workingRecursives = [];
  });

  $("#Button_ListItems_Edit").click(function() {
    switchToFromItemPage();
    fillItemFields(true);

    // Editing items mean that the working exclusions set needs reset
    workingIndexExcl = 0;
    workingExclusions = items[workingIndexItem].exclusions;
    workingRecursives = items[workingIndexItem].exclusionsRecursives;
  });

  $("#Button_ListItems_Remove").click(function() {
    items.splice(workingIndexItem, 1);
    $("#List_ListItems_ArchivedItems").children()[workingIndexItem].remove();
    workingIndexItem--;
  });

  $("#Button_Exclusions_Add").click(function() {
    switchToFromExclPage();
    fillExclusionFields(false);
    workingIndexExcl = workingExclusions.length;
  });

  $("#Button_Exclusions_Edit").click(function() {
    switchToFromExclPage();
    fillExclusionFields(true);
  });

  $("#Button_Exclusions_Remove").click(function() {
    workingExclusions.splice(workingIndexExcl, 1);
    $("#List_Exclusions_Items").children()[workingIndexExcl].remove();
    workingIndexExcl--;
  });

  $("#Button_AddItem_SaveExit").click(function() {
    if (validateItemFields()) {
      if (items.length > workingIndexItem) {
        items[workingIndexItem].itemName = <string>$("#Field_ItemSettings_ItemName").val();
        items[workingIndexItem].sourcePath = <string>$("#Field_ItemSettings_Source").val();
        items[workingIndexItem].destinationPath = <string>$("#Field_ItemSettings_Destination").val();
        items[workingIndexItem].fileName = <string>$("#Field_ItemSettings_FileName").val();
        items[workingIndexItem].password = <string>$("#Field_ItemSettings_Password").val();
        items[workingIndexItem].exclusions = workingExclusions;
        items[workingIndexItem].exclusionsRecursives = workingRecursives;
        items[workingIndexItem].type = <any>$("#Dropdown_ItemSettings_FileType").val();
        items[workingIndexItem].compressionLevel = Number.parseInt(<string>$("#Dropdown_ItemSettings_CompressionLevel").val());
        items[workingIndexItem].compressionMethod = <any>$("#Dropdown_ItemSettings_CompressionMethod").val();

        $("#List_ListItems_ArchivedItems").children()[workingIndexItem].innerHTML = <string>$("#Field_ItemSettings_ItemName").val();
      }

      else {
        let item = new ArchivedItem(
          <string>$("#Field_ItemSettings_ItemName").val(),
          <string>$("#Field_ItemSettings_Source").val(),
          <string>$("#Field_ItemSettings_Destination").val(),
          <string>$("#Field_ItemSettings_FileName").val(),
          <string>$("#Field_ItemSettings_Password").val(),
          workingExclusions,
          workingRecursives,
          <any>$("#Dropdown_ItemSettings_FileType").val(),
          Number.parseInt(<string>$("#Dropdown_ItemSettings_CompressionLevel").val()),
          <any>$("#Dropdown_ItemSettings_CompressionMethod").val()
        );
        items.push(item);

        let elem: JQuery<HTMLElement> = $(ListElementChildTags.start + <string>$("#Field_ItemSettings_ItemName").val() + ListElementChildTags.close);
        $("#List_ListItems_ArchivedItems").append(elem);
        handleListsChildren(elem, false);
        $("#List_ListItems_ArchivedItems").children().removeClass("selected");
      }

      switchToFromItemPage();
    }
  });

  $("#Button_AddItem_NoSaveExit").click(function() {
    switchToFromItemPage();
  });

  $("#Button_AddExcl_SaveExit").click(function() {
    if (validateExclusionFields()) {
      if (workingExclusions.length > workingIndexExcl) {
        workingExclusions[workingIndexExcl] = <string>$("#Field_ExclSettings_ExclName").val();
        workingRecursives[workingIndexExcl] = <boolean>$("#Checkbox_ExclSettings_Recursive").prop("checked");

        $("#List_Exclusions_Items").children()[workingIndexExcl].innerHTML = <string>$("#Field_ExclSettings_ExclName").val();
      }

      else {
        workingExclusions.push(<string>$("#Field_ExclSettings_ExclName").val());
        workingRecursives.push(<boolean><boolean>$("#Checkbox_ExclSettings_Recursive").prop("checked"));

        let elem: JQuery<HTMLElement> = $(ListElementChildTags.start + <string>$("#Field_ExclSettings_ExclName").val() + ListElementChildTags.close);
        $("#List_Exclusions_Items").append(elem);
        handleListsChildren(elem, true);
        $("#List_Exclusions_Items").children().removeClass("selected");
      }


      switchToFromExclPage();
    }
  });

  $("#Button_AddExcl_NoSaveExit").click(function() {
    switchToFromExclPage();
  });
}

/*
** Setup function - fields contained in the archive item editor
*/
function handleItemEditorFields() {
  updateTextWithFileDialog($("#Field_ItemSettings_Source"), true);
  updateTextWithFileDialog($("#Field_ItemSettings_Destination"), true);
  updateTextWithFileDialog($("#Field_FileSettings_SavePath"), false);
  updateTextWithTrimming($("#Field_ItemSettings_FileName"));
  updateTextWithTrimming($("#Field_ItemSettings_ItemName"));
}

/*
** Setup function - the exclusions list's and archived items list's children need events for click
*/
function handleListsChildren(child: JQuery<HTMLElement>, isExclusion: boolean) {
  child.click(function() {
    child.siblings().removeClass("selected");
    child.addClass("selected");
    if (isExclusion)
      workingIndexExcl = child.parent().children().index(child);
    else
      workingIndexItem = child.parent().children().index(child);
  });
}

/*
** Helper function - adds path dialog to path-based inputs
** Also calls updateTextWithTrimming() to add trimming as path-based inputs are in turn file-based inputs
*/
function updateTextWithFileDialog(elem: JQuery<HTMLElement>, isFolder: boolean = false) {
  if (isFolder) {
    elem.dblclick(function() {
      Electron.remote.dialog.showOpenDialog({ properties: [ 'openDirectory' ] }).then((data) => { elem.val(data.filePaths[0]); });
    });
  }

  else {
    elem.dblclick(function() {
      Electron.remote.dialog.showOpenDialog({ filters: [ { name: 'Batch Scripts', extensions: [ 'bat' ] } ], properties: [ 'promptToCreate' ] }).then((data) => { elem.val(data.filePaths[0]); });
    });
  }

  updateTextWithTrimming(elem);
}

/*
** Helper function - adds trimming to file-based inputs
*/
function updateTextWithTrimming(elem: JQuery<HTMLElement>) {
  elem.focusout(function() {
    let _this = <HTMLInputElement>this;
    _this.value = _this.value.trim();
  });
}

/*
** Helper function - toggles when switching between main and item pages
*/
function switchToFromItemPage() {
  mainPage.toggleClass("current-page");
  itemPage.toggleClass("current-page");
}

/*
** Helper function - toggles when switching between item and exclusion pages
*/
function switchToFromExclPage() {
  itemPage.toggleClass("current-page");
  exclPage.toggleClass("current-page");
}

/*
** Utility function - fills up the fields for an archived item depending on whether adding or editing an item
*/
function fillItemFields(isEdit: boolean = false) {
  let listExcl: JQuery<HTMLElement> = $("#List_Exclusions_Items");
  listExcl.empty();

  if (isEdit) {
    $("#Field_ItemSettings_ItemName").val(items[workingIndexItem].itemName);
    $("#Field_ItemSettings_Source").val(items[workingIndexItem].sourcePath);
    $("#Field_ItemSettings_Destination").val(items[workingIndexItem].destinationPath);
    $("#Field_ItemSettings_FileName").val(items[workingIndexItem].fileName);
    $("#Field_ItemSettings_Password").val(items[workingIndexItem].password);
    $("#Dropdown_ItemSettings_FileType").val(items[workingIndexItem].type);
    $("#Dropdown_ItemSettings_CompressionLevel").val(items[workingIndexItem].compressionLevel);
    $("#Dropdown_ItemSettings_CompressionMethod").val(items[workingIndexItem].compressionMethod);

    items[workingIndexItem].exclusions.forEach(e => {
      let elem: JQuery<HTMLElement> = $(ListElementChildTags.start + e + ListElementChildTags.close);
      $("#List_Exclusions_Items").append(elem);
      handleListsChildren(elem, true);
    });
  }

  else {
    $("#Field_ItemSettings_ItemName").val("");
    $("#Field_ItemSettings_Source").val("");
    $("#Field_ItemSettings_Destination").val(<string>$("#Field_GlobalControls_Destination").val());
    $("#Field_ItemSettings_FileName").val("");
    $("#Field_ItemSettings_Password").val(<string>$("#Field_GlobalControls_Password").val());
    $("#Dropdown_ItemSettings_FileType").val(<string>$("#Dropdown_GlobalControls_FileType").val());
    $("#Dropdown_ItemSettings_CompressionLevel").val(<string>$("#Dropdown_GlobalControls_CompressionLevel").val());
    $("#Dropdown_ItemSettings_CompressionMethod").val(<string>$("#Dropdown_GlobalControls_CompressionMethod").val());
  }
}

/*
** Utility function - fills up the fields for an exclusion depending on whether adding or editing an exclusion
*/
function fillExclusionFields(isEdit: boolean = false) {
  if (isEdit) {
    $("#Field_ExclSettings_ExclName").val(workingExclusions[workingIndexExcl]);
    $("#Checkbox_ExclSettings_Recursive").prop("checked", workingRecursives[workingIndexExcl]);
  }

  else {
    $("#Field_ExclSettings_ExclName").val("");
    $("#Checkbox_ExclSettings_Recursive").prop("checked", false);
  }
}

/*
** Utility function - determines whether items are valid or not, visually displays invalid items, and prevents progress if any are present
*/
function validateItemFields() {
  let valid: boolean = true;

  let itemName: HTMLInputElement = <HTMLInputElement>$("#Field_ItemSettings_ItemName").get()[0];
  let itemSrc: HTMLInputElement = <HTMLInputElement>$("#Field_ItemSettings_Source").get()[0];
  let itemDest: HTMLInputElement = <HTMLInputElement>$("#Field_ItemSettings_Destination").get()[0];
  let itemFile: HTMLInputElement = <HTMLInputElement>$("#Field_ItemSettings_FileName").get()[0];

  let elements: HTMLInputElement[] = [ itemName, itemSrc, itemDest, itemFile ];

  elements.forEach(element => {
    if (element.value == "" || !element.checkValidity()) {
      valid = false;
      let old = element;
      let clone: HTMLElement = <HTMLElement>old.cloneNode(true);
      old.before(clone);
      old.remove();
      clone.classList.add("invalid-item");
    }

    else
      element.classList.remove("invalid-item");
  });

  return valid;
}

/*
** Utility function - determines whether exclusions are valid or not, visually displays invalid entries, and prevents progress if any are present
*/
function validateExclusionFields() {
  let valid: boolean = true;

  let exclName: HTMLInputElement = <HTMLInputElement>$("#Field_ExclSettings_ExclName").get()[0];

  if (exclName.value == "" || !exclName.checkValidity()) {
    valid = false;
    let old = exclName;
    let clone: HTMLElement = <HTMLElement>old.cloneNode(true);
    old.before(clone);
    old.remove();
    clone.classList.add("invalid-item");
  }

  else
    exclName.classList.remove("invalid-item");

  return valid;
}

/*
** Utility function - determines whether main settings are valid or not, visually displays invalid entries, and prevents progress if any are present
*/
function validateMainFields() {
  let valid: boolean = true;

  let scriptFile: HTMLInputElement = <HTMLInputElement>$("#Field_FileSettings_SavePath").get()[0];
  let itemsList: JQuery<HTMLElement> = $("#List_ListItems_ArchivedItems");

  if (scriptFile.value == "" || !scriptFile.checkValidity()) {
    valid = false;
    let old = scriptFile;
    let clone: HTMLElement = <HTMLElement>old.cloneNode(true);
    old.before(clone);
    old.remove();
    clone.classList.add("invalid-item");
  }

  else
    scriptFile.classList.remove("invalid-item");

  if (itemsList.children().length <= 0) {
    valid = false;
    let old = itemsList;
    let clone = old.clone();
    clone.appendTo(old.parent());
    old.remove();
    clone.addClass("invalid-item");
  }

  else
    itemsList.removeClass("invalid-item");

  return valid;
}

/*
**  Utility function - determines whether globals are valid or not, visually displays invalid entries, and prevents progress if any are present
*/
function validateGlobalFields() {

}
