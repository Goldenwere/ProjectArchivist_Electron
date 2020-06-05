window.$ = window.jQuery = require('jquery');
Electron = require('electron');
tippy = require('tippy.js').default;

const TooltipArrow = true;
const TooltipPlacement = 'bottom-end';
const TooltipContent = {
  // File Settings / Other
  Control_FileSettings_SavePath: "Click here to define where to save the script to and its file name",
  Control_Archiving_CreateScript: "Saves all defined archive items to the batch script defined at the top of the window",
  // Archive items list
  Control_ListItems_ArchivedItems: "This is where archived items appear. To select one for editing/removal, click on it",
  Control_ListItems_Add: "Switches to the item window to add an archived item to the list",
  Control_ListItems_Edit: "Switches to the item window to edit a selected archived item",
  Control_ListItems_Remove: "Removes the currently selected archived item from the list",
  // Globals
  Control_GlobalControls_Password: "Sets the default password for new items",
  Control_GlobalControls_FileType: "Sets the default file type for new items",
  Control_GlobalControls_CompressionLevel: "Sets the default compression level for new items",
  Control_GlobalControls_CompressionMethod: "Sets the default compression method for new items",
  Control_GlobalControls_Destination: "Sets the default destination path (excludes file name) for new items",
  Control_GlobalControls_ApplyGlobals: "Applies whatever is currently set in the above settings to any existing items",
  // Item editor
  Control_ItemSettings_ItemName: "Sets the item's name. This has no effect on what is archived, but is used for terminal feedback and keeping track of items in this editor",
  Control_ItemSettings_Source: "Sets the item's source path. Make sure this is a directory, as its contents will be what is added to the archive",
  Control_ItemSettings_Destination: "Sets the item's destination path. This does not include the output file's name",
  Control_ItemSettings_FileName: "Sets the item's file name. This does not need to include the extension, as this is determined by the file type setting",
  Control_ItemSettings_Password: "(Optional) Sets the password for the item. Leave this field blank (or delete its contents) if you do not want the item to be password protected",
  Control_ItemSettings_FileType: "Sets the file type/extension for the item",
  Control_ItemSettings_CompressionLevel: "Sets the level of compression for the item. 0 means no compression, 9 is the highest compression level",
  Control_ItemSettings_CompressionMethod: "Sets the compression method for the item",
  // Item editor exclusion list
  Control_Exclusions_Items: "This is where exclusions appear. To select one for editing/removal, click on it",
  Control_Exclusions_Add: "Switches to the exclusion window to add an exclusion to the list",
  Control_Exclusions_Edit: "Switches to the exclusion window to edit a selected exclusion",
  Control_Exclusions_Remove: "Removes the currently selected exclusion from the list",
  // Item editor exit buttons
  Control_AddItem_SaveExit: "Saves the item and switches back to the main window",
  Control_AddItem_NoSaveExit: "Switches back to the main window without saving the item",
  // Exclusion editor
  Control_ExclSettings_Exclusion: "The thing that is being excluded. Uses 7-Zip-defined wildcards, where \n\t'*.txt' would target all files with the .txt extension, \n\t'?a*' would target all files with a second character of 'a', \n\t'*1*' would target all files containing the character '1', \n\t'*.*.*' would target all files that contain two at least '.' characters",
  Control_ExclSettings_Recursive: "Whether this exclusion is recursive. Without recursion, the exclusion will only work at the top level of the source. With recursion, any instance of the exclusion will be excluded",
  Control_AddExcl_SaveExit: "Saves the exclusion and switches back to the item window",
  Control_AddExcl_NoSaveExit: "Switches back to the item window without saving the exclusion"
}

const ListElementChildTags = {
  start: "<listelem>",
  close: "</listelem>"
}

const PageSounds = {
  UI_Click: new Audio('media/click.wav', {
    autoplay: false,
    loop: false
  }),

  UI_Success: new Audio('media/success.wav', {
    autoplay: false,
    loop: false
  }),

  UI_Error: new Audio('media/error.wav', {
    autoplay: false,
    loop: false
  })
}

let mainPage, itemPage, exclPage, errWinDesc, errWinAddl;
let items, workingExclusions, workingRecursives, workingIndexItem, workingIndexExcl;

$(document).ready(function() {
  mainPage = $("#Page_Main");
  itemPage = $("#Page_Item");
  exclPage = $("#Page_Excl");

  errWinDesc = $("#Error_Desc");
  errWinAddl = $("#Error_Additional");

  mainPage.toggleClass("current-page");
  workingIndexItem = 0;
  workingIndexExcl = 0;
  items = [];
  $("#Button_ListItems_Edit").prop("disabled", true);
  $("#Button_ListItems_Remove").prop("disabled", true);

  handleWindowButtons();
  handleItemEditorFields();
  handleTooltips();
});

/*
** Setup function - all buttons that in some way change page states in the window (add, edit, save/exit)
** Because they are grouped with add/edit, remove buttons are also in here, though they don't necessarily change the entire page
*/
function handleWindowButtons() {
  $("#Button_Archiving_CreateScript").click(function() {
    if (validateMainFields()) {
      writeScript(items, $("#Field_FileSettings_SavePath").val(), function(err) {
        if (err) {
          PageSounds.UI_Error.play();
          $("#Window_Error").removeClass("error-window-hidden");
          $("#Window_Error_Overlay").removeClass("error-window-hidden");
          errWinDesc.html("Error writing file");
          errWinAddl.html(err);
        }

        else
          PageSounds.UI_Success.play();
      });
    }

    else
      PageSounds.UI_Error.play();
  });

  $("#Button_ListItems_Add").click(function() {
    PageSounds.UI_Click.play();
    switchToFromItemPage();
    fillItemFields(false);
    workingIndexItem = items.length;

    // New items mean that the working exclusions set needs reset
    workingIndexExcl = 0;
    workingExclusions = [];
    workingRecursives = [];
  });

  $("#Button_ListItems_Edit").click(function() {
    if (items.length > 0) {
      PageSounds.UI_Click.play();
      switchToFromItemPage();
      fillItemFields(true);

      // Editing items mean that the working exclusions set needs reset
      workingIndexExcl = 0;
      workingExclusions = items[workingIndexItem].exclusions;
      workingRecursives = items[workingIndexItem].exclusionsRecursives;
    }
  });

  $("#Button_ListItems_Remove").click(function() {
    if (items.length > 0) {
      PageSounds.UI_Click.play();
      items.splice(workingIndexItem, 1);
      $("#List_ListItems_ArchivedItems").children()[workingIndexItem].remove();
      if (items.length <= workingIndexItem)
        workingIndexItem--;
      if (items.length > 0)
        $("#List_ListItems_ArchivedItems").children()[workingIndexItem].classList.add("selected");
      else {
        $("#Button_ListItems_Edit").prop("disabled", true);
        $("#Button_ListItems_Remove").prop("disabled", true);
      }
    }
  });

  $("#Button_Exclusions_Add").click(function() {
    switchToFromExclPage();
    fillExclusionFields(false);
    workingIndexExcl = workingExclusions.length;
    PageSounds.UI_Click.play();
  });

  $("#Button_Exclusions_Edit").click(function() {
    if (workingExclusions.length > 0) {
      switchToFromExclPage();
      fillExclusionFields(true);
      PageSounds.UI_Click.play();
    }
  });

  $("#Button_Exclusions_Remove").click(function() {
    if (workingExclusions.length > 0) {
      PageSounds.UI_Click.play();
      workingExclusions.splice(workingIndexExcl, 1);
      $("#List_Exclusions_Items").children()[workingIndexExcl].remove();
      if (workingExclusions.length <= workingIndexExcl)
        workingIndexExcl--;
      if (workingExclusions.length > 0)
        $("#List_Exclusions_Items").children()[workingIndexExcl].classList.add("selected");
      else {
        $("#Button_Exclusions_Edit").prop("disabled", true);
        $("#Button_Exclusions_Remove").prop("disabled", true);
      }
    }
  });

  $("#Button_AddItem_SaveExit").click(function() {
    if (validateItemFields()) {
      $("#Button_ListItems_Edit").prop("disabled", false);
      $("#Button_ListItems_Remove").prop("disabled", false);
      PageSounds.UI_Click.play();
      $("#List_ListItems_ArchivedItems").removeClass("invalid-item");

      if (items.length > workingIndexItem) {
        items[workingIndexItem].itemName = $("#Field_ItemSettings_ItemName").val();
        items[workingIndexItem].sourcePath = $("#Field_ItemSettings_Source").val();
        items[workingIndexItem].destinationPath = $("#Field_ItemSettings_Destination").val();
        items[workingIndexItem].fileName = $("#Field_ItemSettings_FileName").val();
        items[workingIndexItem].password = $("#Field_ItemSettings_Password").val();
        items[workingIndexItem].exclusions = workingExclusions;
        items[workingIndexItem].exclusionsRecursives = workingRecursives;
        items[workingIndexItem].type = $("#Dropdown_ItemSettings_FileType").val();
        items[workingIndexItem].compressionLevel = Number.parseInt($("#Dropdown_ItemSettings_CompressionLevel").val());
        items[workingIndexItem].compressionMethod = $("#Dropdown_ItemSettings_CompressionMethod").val();

        $("#List_ListItems_ArchivedItems").children()[workingIndexItem].innerHTML = $("#Field_ItemSettings_ItemName").val();
      }

      else {
        let item = new ArchivedItem(
          $("#Field_ItemSettings_ItemName").val(),
          $("#Field_ItemSettings_Source").val(),
          $("#Field_ItemSettings_Destination").val(),
          $("#Field_ItemSettings_FileName").val(),
          $("#Field_ItemSettings_Password").val(),
          workingExclusions,
          workingRecursives,
          $("#Dropdown_ItemSettings_FileType").val(),
          Number.parseInt($("#Dropdown_ItemSettings_CompressionLevel").val()),
          $("#Dropdown_ItemSettings_CompressionMethod").val()
        );
        items.push(item);

        let elem = $(ListElementChildTags.start + $("#Field_ItemSettings_ItemName").val() + ListElementChildTags.close);
        $("#List_ListItems_ArchivedItems").append(elem);
        handleListsChildren(elem, false);
        $("#List_ListItems_ArchivedItems").children().removeClass("selected");
        elem.addClass("selected");
      }

      switchToFromItemPage();
    }

    else
      PageSounds.UI_Error.play();
  });

  $("#Button_AddItem_NoSaveExit").click(function() {
    switchToFromItemPage();
    PageSounds.UI_Click.play();
  });

  $("#Button_AddExcl_SaveExit").click(function() {
    if (validateExclusionFields()) {
      PageSounds.UI_Click.play();
      $("#Button_Exclusions_Edit").prop("disabled", false);
      $("#Button_Exclusions_Remove").prop("disabled", false);

      if (workingExclusions.length > workingIndexExcl) {
        workingExclusions[workingIndexExcl] = $("#Field_ExclSettings_ExclName").val();
        workingRecursives[workingIndexExcl] = $("#Checkbox_ExclSettings_Recursive").prop("checked");

        $("#List_Exclusions_Items").children()[workingIndexExcl].innerHTML = $("#Field_ExclSettings_ExclName").val();
      }

      else {
        workingExclusions.push($("#Field_ExclSettings_ExclName").val());
        workingRecursives.push($("#Checkbox_ExclSettings_Recursive").prop("checked"));

        let elem = $(ListElementChildTags.start + $("#Field_ExclSettings_ExclName").val() + ListElementChildTags.close);
        $("#List_Exclusions_Items").append(elem);
        handleListsChildren(elem, true);
        $("#List_Exclusions_Items").children().removeClass("selected");
        elem.addClass("selected");
      }

      switchToFromExclPage();
    }

    else
      PageSounds.UI_Error.play();
  });

  $("#Button_AddExcl_NoSaveExit").click(function() {
    switchToFromExclPage();
    PageSounds.UI_Click.play();
  });

  $("#Button_GlobalControls_ApplyGlobals").click(function() {
    let duplicates = validateGlobalFields();
    if (duplicates.length <= 0) {
      PageSounds.UI_Click.play();
      for (let i = 0; i < items.length; i++) {
        items[i].password = $("#Field_GlobalControls_Password").val();
        items[i].type = $("#Dropdown_GlobalControls_FileType").val();
        items[i].compressionMethod = $("#Dropdown_GlobalControls_CompressionMethod").val();
        items[i].compressionLevel = Number.parseInt($("#Dropdown_GlobalControls_CompressionLevel").val());
        items[i].destinationPath = $("#Field_GlobalControls_Destination").val();
      }
    }

    else {
      PageSounds.UI_Error.play();
      $("#Window_Error").removeClass("error-window-hidden");
      $("#Window_Error_Overlay").removeClass("error-window-hidden");
      errWinDesc.html("There are items that have the same file name that applying a global destination path would create invalid items. Either change the file names for these items or change the destination path");
      let inner = "";
      for (let i = 0; i < duplicates.length - 1; i++)
        inner += duplicates[i] + ", ";
      inner += duplicates[duplicates.length - 1];
      errWinAddl.html(inner);
    }
  });

  $("#Button_Error_Acknowledge").click(function() {
    $("#Window_Error").addClass("error-window-hidden");
    $("#Window_Error_Overlay").addClass("error-window-hidden");
  });
}

/*
** Setup function - fields contained in the archive item editor
*/
function handleItemEditorFields() {
  updateTextWithFileDialog($("#Field_ItemSettings_Source"), true);
  updateTextWithFileDialog($("#Field_ItemSettings_Destination"), true);
  updateTextWithFileDialog($("#Field_GlobalControls_Destination"), true);
  updateTextWithFileDialog($("#Field_FileSettings_SavePath"), false);
  updateTextWithTrimming($("#Field_ItemSettings_FileName"));
  updateTextWithTrimming($("#Field_ItemSettings_ItemName"));
}

/*
** Setup function - the exclusions list's and archived items list's children need events for click
*/
function handleListsChildren(child, isExclusion) {
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
** Setup function - tooltips for all inputs in all windows
*/
function handleTooltips() {
  // File Settings / Other
  tippy('#Control_FileSettings_SavePath', { content: TooltipContent.Control_FileSettings_SavePath, arrow: TooltipArrow, placement: TooltipPlacement });
  tippy('#Control_Archiving_CreateScript', { content: TooltipContent.Control_Archiving_CreateScript, arrow: TooltipArrow, placement: TooltipPlacement });
  // Archive items list
  tippy('#Control_ListItems_ArchivedItems', { content: TooltipContent.Control_ListItems_ArchivedItems, arrow: TooltipArrow, placement: TooltipPlacement });
  tippy('#Control_ListItems_Add', { content: TooltipContent.Control_ListItems_Add, arrow: TooltipArrow, placement: TooltipPlacement });
  tippy('#Control_ListItems_Edit', { content: TooltipContent.Control_ListItems_Edit, arrow: TooltipArrow, placement: TooltipPlacement });
  tippy('#Control_ListItems_Remove', { content: TooltipContent.Control_ListItems_Remove, arrow: TooltipArrow, placement: TooltipPlacement });
  // Globals
  tippy('#Control_GlobalControls_Password', { content: TooltipContent.Control_GlobalControls_Password, arrow: TooltipArrow, placement: TooltipPlacement });
  tippy('#Control_GlobalControls_FileType', { content: TooltipContent.Control_GlobalControls_FileType, arrow: TooltipArrow, placement: TooltipPlacement });
  tippy('#Control_GlobalControls_CompressionLevel', { content: TooltipContent.Control_GlobalControls_CompressionLevel, arrow: TooltipArrow, placement: TooltipPlacement });
  tippy('#Control_GlobalControls_CompressionMethod', { content: TooltipContent.Control_GlobalControls_CompressionMethod, arrow: TooltipArrow, placement: TooltipPlacement });
  tippy('#Control_GlobalControls_Destination', { content: TooltipContent.Control_GlobalControls_Destination, arrow: TooltipArrow, placement: TooltipPlacement });
  tippy('#Control_GlobalControls_ApplyGlobals', { content: TooltipContent.Control_GlobalControls_ApplyGlobals, arrow: TooltipArrow, placement: TooltipPlacement });
  // Item editor
  tippy('#Control_ItemSettings_ItemName', { content: TooltipContent.Control_ItemSettings_ItemName, arrow: TooltipArrow, placement: TooltipPlacement });
  tippy('#Control_ItemSettings_Source', { content: TooltipContent.Control_ItemSettings_Source, arrow: TooltipArrow, placement: TooltipPlacement });
  tippy('#Control_ItemSettings_Destination', { content: TooltipContent.Control_ItemSettings_Destination, arrow: TooltipArrow, placement: TooltipPlacement });
  tippy('#Control_ItemSettings_FileName', { content: TooltipContent.Control_ItemSettings_FileName, arrow: TooltipArrow, placement: TooltipPlacement });
  tippy('#Control_ItemSettings_Password', { content: TooltipContent.Control_ItemSettings_Password, arrow: TooltipArrow, placement: TooltipPlacement });
  tippy('#Control_ItemSettings_FileType', { content: TooltipContent.Control_ItemSettings_FileType, arrow: TooltipArrow, placement: TooltipPlacement });
  tippy('#Control_ItemSettings_CompressionLevel', { content: TooltipContent.Control_ItemSettings_CompressionLevel, arrow: TooltipArrow, placement: TooltipPlacement });
  tippy('#Control_ItemSettings_CompressionMethod', { content: TooltipContent.Control_ItemSettings_CompressionMethod, arrow: TooltipArrow, placement: TooltipPlacement });
  // Item editor exclusion list
  tippy('#Control_Exclusions_Items', { content: TooltipContent.Control_Exclusions_Items, arrow: TooltipArrow, placement: TooltipPlacement });
  tippy('#Control_Exclusions_Add', { content: TooltipContent.Control_Exclusions_Add, arrow: TooltipArrow, placement: TooltipPlacement });
  tippy('#Control_Exclusions_Edit', { content: TooltipContent.Control_Exclusions_Edit, arrow: TooltipArrow, placement: TooltipPlacement });
  tippy('#Control_Exclusions_Remove', { content: TooltipContent.Control_Exclusions_Remove, arrow: TooltipArrow, placement: TooltipPlacement });
  // Item editor exit buttons
  tippy('#Control_AddItem_SaveExit', { content: TooltipContent.Control_AddItem_SaveExit, arrow: TooltipArrow, placement: TooltipPlacement });
  tippy('#Control_AddItem_NoSaveExit', { content: TooltipContent.Control_AddItem_NoSaveExit, arrow: TooltipArrow, placement: TooltipPlacement });
  // Exclusion editor
  tippy('#Control_ExclSettings_Exclusion', { content: TooltipContent.Control_ExclSettings_Exclusion, arrow: TooltipArrow, placement: TooltipPlacement });
  tippy('#Control_ExclSettings_Recursive', { content: TooltipContent.Control_ExclSettings_Recursive, arrow: TooltipArrow, placement: TooltipPlacement });
  tippy('#Control_AddExcl_SaveExit', { content: TooltipContent.Control_AddExcl_SaveExit, arrow: TooltipArrow, placement: TooltipPlacement });
  tippy('#Control_AddExcl_NoSaveExit', { content: TooltipContent.Control_AddExcl_NoSaveExit, arrow: TooltipArrow, placement: TooltipPlacement });
}

/*
** Helper function - adds path dialog to path-based inputs
** Also calls updateTextWithTrimming() to add trimming as path-based inputs are in turn file-based inputs
*/
function updateTextWithFileDialog(elem, isFolder = false) {
  if (isFolder) {
    elem.click(function() {
      Electron.remote.dialog.showOpenDialog({ properties: [ 'openDirectory' ] }).then((data) => { elem.val(data.filePaths[0]); });
    });
  }

  else {
    elem.click(function() {
      Electron.remote.dialog.showOpenDialog({ filters: [ { name: 'Batch Scripts', extensions: [ 'bat' ] } ], properties: [ 'promptToCreate' ] }).then((data) => { elem.val(data.filePaths[0]); });
    });
  }

  updateTextWithTrimming(elem);
}

/*
** Helper function - adds trimming to file-based inputs
*/
function updateTextWithTrimming(elem) {
  elem.focusout(function() {
    let _this = this;
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
function fillItemFields(isEdit = false) {
  let listExcl = $("#List_Exclusions_Items");
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

    if (items[workingIndexItem].exclusions.length <= 0) {
      $("#Button_Exclusions_Edit").prop("disabled", true);
      $("#Button_Exclusions_Remove").prop("disabled", true);
    }

    else {
      $("#Button_Exclusions_Edit").prop("disabled", false);
      $("#Button_Exclusions_Remove").prop("disabled", false);
      items[workingIndexItem].exclusions.forEach(e => {
        let elem = $(ListElementChildTags.start + e + ListElementChildTags.close);
        $("#List_Exclusions_Items").append(elem);
        handleListsChildren(elem, true);
      });
    }
  }

  else {
    $("#Field_ItemSettings_ItemName").val("");
    $("#Field_ItemSettings_Source").val("");
    $("#Field_ItemSettings_Destination").val($("#Field_GlobalControls_Destination").val());
    $("#Field_ItemSettings_FileName").val("");
    $("#Field_ItemSettings_Password").val($("#Field_GlobalControls_Password").val());
    $("#Dropdown_ItemSettings_FileType").val($("#Dropdown_GlobalControls_FileType").val());
    $("#Dropdown_ItemSettings_CompressionLevel").val($("#Dropdown_GlobalControls_CompressionLevel").val());
    $("#Dropdown_ItemSettings_CompressionMethod").val($("#Dropdown_GlobalControls_CompressionMethod").val());
    $("#Button_Exclusions_Edit").prop("disabled", true);
    $("#Button_Exclusions_Remove").prop("disabled", true);
  }
}

/*
** Utility function - fills up the fields for an exclusion depending on whether adding or editing an exclusion
*/
function fillExclusionFields(isEdit = false) {
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
  let valid = true;

  let itemName = $("#Field_ItemSettings_ItemName").get()[0];
  let itemSrc = $("#Field_ItemSettings_Source").get()[0];
  let itemDest = $("#Field_ItemSettings_Destination").get()[0];
  let itemFile = $("#Field_ItemSettings_FileName").get()[0];

  let elements = [ itemName, itemSrc, itemDest, itemFile ];

  elements.forEach(element => {
    if (element.value == "" || !element.checkValidity()) {
      valid = false;
      let old = element;
      let clone = old.cloneNode(true);
      old.before(clone);
      old.remove();
      clone.classList.add("invalid-item");
    }

    else {
      let invalidMessages = [];

      for (let i = 0; i < items.length; i++) {
        if (i != workingIndexItem) {
          if (itemName.value == items[i].itemName)
            invalidMessages.push("Item name already exists");

          if (items[i].destinationPath == itemDest.value && items[i].fileName == itemFile.value)
            invalidMessages.push("Item has same destination path and file name as " + items[i].itemName);
        }
      }

      if (invalidMessages.length > 0) {
        valid = false;
        $("#Window_Error").removeClass("error-window-hidden");
        $("#Window_Error_Overlay").removeClass("error-window-hidden");
        errWinDesc.html("Item has conflicts with existing items");
        let inner = "";
        for (let i = 0; i < invalidMessages.length; i++)
          inner += invalidMessages[i] + "<br/>";
        errWinAddl.html(inner);
      }

      else
        element.classList.remove("invalid-item");
    }
  });

  return valid;
}

/*
** Utility function - determines whether exclusions are valid or not, visually displays invalid entries, and prevents progress if any are present
*/
function validateExclusionFields() {
  let valid = true;

  let exclName = $("#Field_ExclSettings_ExclName").get()[0];

  if (exclName.value == "" || !exclName.checkValidity()) {
    valid = false;
    let old = exclName;
    let clone = old.cloneNode(true);
    old.before(clone);
    old.remove();
    clone.classList.add("invalid-item");
  }

  else {
    let invalidMessages = [];
    for (let i = 0; i < workingExclusions.length; i++) {
      if (i != workingIndexExcl && exclName.value == workingExclusions[i])
        invalidMessages.push("Exclusion already exists");
    }

    if (invalidMessages.length > 0) {
      valid = false;
      $("#Window_Error").removeClass("error-window-hidden");
      $("#Window_Error_Overlay").removeClass("error-window-hidden");
      errWinDesc.html("Exclusion has conflicts with existing exclusions");
      let inner = "";
      for (let i = 0; i < invalidMessages.length; i++)
        inner += invalidMessages[i] + "<br/>";
      errWinAddl.html(inner);
    }

    else
      exclName.classList.remove("invalid-item");
  }

  return valid;
}

/*
** Utility function - determines whether main settings are valid or not, visually displays invalid entries, and prevents progress if any are present
*/
function validateMainFields() {
  let valid = true;

  let scriptFile = $("#Field_FileSettings_SavePath").get()[0];
  let itemsList = $("#List_ListItems_ArchivedItems");

  if (scriptFile.value == "" || !scriptFile.checkValidity()) {
    valid = false;
    let old = scriptFile;
    let clone = old.cloneNode(true);
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
  let duplicates = [];

  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < items.length; j++) {
      if (i != j && items[i].fileName == items[j].fileName) {
        if(!duplicates.includes(items[i].itemName))
          duplicates.push(items[i].itemName);
        if(!duplicates.includes(items[j].itemName))
          duplicates.push(items[j].itemName);
      }
    }
  }

  return duplicates;
}
