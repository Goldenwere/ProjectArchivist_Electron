import $ from "jquery";
import Electron from "electron";

let mainPage: JQuery<HTMLElement>;
let itemPage: JQuery<HTMLElement>;
let exclPage: JQuery<HTMLElement>;
let items: ProjectArchivist.ArchivedItem[];
let workingIndex: number;

$(document).ready(function() {
  mainPage = $("#Page_Main");
  itemPage = $("#Page_Item");
  exclPage = $("#Page_Excl");

  mainPage.toggleClass("current-page");
  workingIndex = 0;
  items = [];

  handleWindowButtons();
  handleItemEditorFields();
});

function handleWindowButtons() {
  $("#Button_ListItems_Add").click(function() {
    switchToFromItemPage();
  });

  $("#Button_ListItems_Edit").click(function() {
    switchToFromItemPage();
    items[workingIndex] = new ProjectArchivist.ArchivedItem();
  });

  $("#Button_Exclusions_Add").click(function() {
    switchToFromExclPage();
  });

  $("#Button_Exclusions_Edit").click(function() {
    switchToFromExclPage();
  });

  $("#Button_AddItem_SaveExit").click(function() {
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

function handleItemEditorFields() {
  updateTextWithFileDialog($("#Field_ItemSettings_ItemName"));
  updateTextWithFileDialog($("#Field_ItemSettings_Source"));
  updateTextWithFileDialog($("#Field_ItemSettings_Destination"));
}

function updateTextWithFileDialog(elem: JQuery<HTMLElement>) {
  elem.dblclick(function() {
    Electron.remote.dialog.showOpenDialog({ properties: [ 'openDirectory' ] }).then((data) => { elem.val(data.filePaths[0]); });
  });
}

function switchToFromItemPage() {
  mainPage.toggleClass("current-page");
  itemPage.toggleClass("current-page");
}

function switchToFromExclPage() {
  itemPage.toggleClass("current-page");
  exclPage.toggleClass("current-page");
}
