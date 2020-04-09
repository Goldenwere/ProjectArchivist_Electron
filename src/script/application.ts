import $ from "jquery";

namespace ProjectArchivist {
  let mainPage: JQuery<HTMLElement>;
  let itemPage: JQuery<HTMLElement>;
  let exclPage: JQuery<HTMLElement>;

  $(document).ready(function() {
    mainPage = $("#Page_Main");
    itemPage = $("#Page_Item");
    exclPage = $("#Page_Excl");

    mainPage.toggleClass("current-page");
    itemPage.toggleClass("hidden-page");
    exclPage.toggleClass("hidden-page");
  });
}
