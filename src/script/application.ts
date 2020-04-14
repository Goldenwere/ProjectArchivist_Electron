import $ from "jquery";
import Electron from "electron";

let mainPage: JQuery<HTMLElement>;
let itemPage: JQuery<HTMLElement>;
let exclPage: JQuery<HTMLElement>;
let items: ProjectArchivist.ArchivedItem[];
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
  handleLists();
});

/*
** Setup function - all buttons that in some way change page states in the window (add, edit, save/exit)
** Because they are grouped with add/edit, remove buttons are also in here, though they don't necessarily change the entire page
*/
function handleWindowButtons() {
  $("#Button_ListItems_Add").click(function() {
    switchToFromItemPage();
    workingIndexItem++;
    fillItemFields(false);
  });

  $("#Button_ListItems_Edit").click(function() {
    switchToFromItemPage();
    fillItemFields(true);
  });

  $("#Button_Exclusions_Add").click(function() {
    switchToFromExclPage();
  });

  $("#Button_Exclusions_Edit").click(function() {
    switchToFromExclPage();
  });

  $("#Button_AddItem_SaveExit").click(function() {
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
    }

    else {
      let item = new ProjectArchivist.ArchivedItem(
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
    }
    switchToFromItemPage();
  });

  $("#Button_AddItem_NoSaveExit").click(function() {
    switchToFromItemPage();
  });

  $("#Button_AddExcl_SaveExit").click(function() {
    switchToFromExclPage();
  });

  $("#Button_AddExcl_NoSaveExit").click(function() {
    switchToFromExclPage();
  });
}

/*
** Setup function - fields contained in the archive item editor
*/
function handleItemEditorFields() {
  updateTextWithFileDialog($("#Field_ItemSettings_Source"));
  updateTextWithFileDialog($("#Field_ItemSettings_Destination"));
  updateTextWithTrimming($("#Field_ItemSettings_FileName"));
  updateTextWithTrimming($("#Field_ItemSettings_ItemName"));
}

/*
** Setup function - the exclusions list and archived items list
*/
function handleLists() {
  let itemList: JQuery<HTMLElement> = $("#List_ListItems_ArchivedItems");
  let exclList: JQuery<HTMLElement> = $("#List_Exclusions_Items");

  itemList.children().on('click', e => {
    itemList.children().removeClass("selected");
    e.target.classList.add("selected");
    workingIndexItem = itemList.children().index(e.target);
  });

  exclList.children().on('click', e => {
    exclList.children().removeClass("selected");
    e.target.classList.add("selected");
    workingIndexExcl = exclList.children().index(e.target);
  });
}

/*
** Helper function - adds path dialog to path-based inputs
** Also calls updateTextWithTrimming() to add trimming as path-based inputs are in turn file-based inputs
*/
function updateTextWithFileDialog(elem: JQuery<HTMLElement>) {
  elem.dblclick(function() {
    Electron.remote.dialog.showOpenDialog({ properties: [ 'openDirectory' ] }).then((data) => { elem.val(data.filePaths[0]); });
  });

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
** Utility function - filles up the fields for an archived item depending on whether adding or editing an item
*/
function fillItemFields(isEdit: boolean = false) {
  if (isEdit) {
    $("#Field_ItemSettings_ItemName").val(items[workingIndexItem].itemName);
    $("#Field_ItemSettings_Source").val(items[workingIndexItem].sourcePath);
    $("#Field_ItemSettings_Destination").val(items[workingIndexItem].destinationPath);
    $("#Field_ItemSettings_FileName").val(items[workingIndexItem].fileName);
    $("#Field_ItemSettings_Password").val(items[workingIndexItem].password);
    $("#Dropdown_ItemSettings_FileType").val(items[workingIndexItem].type);
    $("#Dropdown_ItemSettings_CompressionLevel").val(items[workingIndexItem].compressionLevel);
    $("#Dropdown_ItemSettings_CompressionMethod").val(items[workingIndexItem].compressionMethod);
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
