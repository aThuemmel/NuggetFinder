/* ******************************************************* */
/* Configuration                                           */
/* ******************************************************* */

var globalSettings = new Object();

// Demo

globalSettings.isDemoMode                                   = false;                      // true = only the configured applications / nuggets are available, false = all applications and nuggets available
globalSettings.demoApplicationIds                           = new Array( 'excel', 'outlook', 'powerpoint', 'word' );
globalSettings.demoNuggetIds                                = new Array( 'exl0043', 'exl0105', 'exl0126', 'out0041', 'out0155', 'ppt0008', 'ppt0022', 'ppt0034', 'wrd0132', 'wrd0134', 'wrd0146' );     // empty = all nuggets from demo applications available, identifier-array = only configured nuggets are available

// Custom Content

globalSettings.hasCustomContent                             = false;                       // true = custom applications / nuggets are available, false = only the configured Know How! AG applications / nuggets are available
globalSettings.customContentPostfix                         = '_custom';                  // postfix for all custom ids and locations

// Menu

globalSettings.showMainMenuButton                           = true;
globalSettings.showMainMenuHelpButton                       = true;
globalSettings.showMainMenuPrivacyButton                    = false;
globalSettings.showMainMenuPrivacyHref                      = 'pages/privacy.html';       // {language} => will be replaced with current language
globalSettings.showMainMenuPrivacyOpenMethod                = 'overlay';                  // 'window' = opens browser window, 'overlay' = opens overlay with iframe
globalSettings.showMainMenuPrivacyOverlayWidth              = '97%';                      // number or 'xy%'
globalSettings.showMainMenuPrivacyOverlayHeight             = '97%';                      // number or 'xy%'
globalSettings.showMainMenuCopyrightButton                  = true;
globalSettings.showMainMenuCopyrightHref                    = 'pages/copyright.html?language={language}';           // {language} => will be replaced with current language
globalSettings.showMainMenuCopyrightOpenMethod              = 'overlay';                  // 'window' = opens browser window, 'overlay' = opens overlay with iframe
globalSettings.showMainMenuCopyrightOverlayWidth            = '400';                      // number or 'xy%'
globalSettings.showMainMenuCopyrightOverlayHeight           = '400';                      // number or 'xy%'
globalSettings.showMainMenuImprintButton                    = false;
globalSettings.showMainMenuImprintHref                      = 'https://www.knowhow.de/impressum1.html';                 // {language} => will be replaced with current language
globalSettings.showMainMenuImprintOpenMethod                = 'overlay';                  // 'window' = opens browser window, 'overlay' = opens overlay with iframe
globalSettings.showMainMenuImprintOverlayWidth              = '97%';                      // number or 'xy%'
globalSettings.showMainMenuImprintOverlayHeight             = '97%';                      // number or 'xy%'

// Language

globalSettings.defaultLanguage = 'de';
globalSettings.availableLanguages                           = new Array( 'de' );
globalSettings.availableLanguageNames                       = { 'de' : 'Deutsch', 'en' : 'English', 'fr' : 'Français', 'it' : 'Italiano', 'es' : 'Español', 'pt' : 'Português', 'pt-br' : 'Brasileiro', 'zh-cn' : '中文', 'zh-tw' : '中文', 'ja' : '日本語', 'ko' : '한국어', 'nl' : 'Nederlands', 'ru' : 'Русский', 'pl' : 'Polski'}
globalSettings.useLocalStorageLanguage                      = false;

// Application

globalSettings.applicationLoadMethod                        = 'local';                    // 'local', 'ajax'
globalSettings.applicationLoadAjaxUrl                       = '';                         // url to load json file
globalSettings.applicationSortByTitle                       = true;                       // true = application drop down is sorted, false = application drop down is not sorted
globalSettings.applicationGenerateAll                       = true;
globalSettings.applicationAllId				                = 'all';
globalSettings.applicationAllTitleId                        = 'application_all';
globalSettings.applicationAllVersion                        = '2013';
globalSettings.applicationAllClassNames                     = 'fa fa-graduation-cap fa-fw';
globalSettings.applicationAllNuggetPlayerUrl                = 'index.html?nuggetId={nuggetId}&nuggetBase=content{optionalCustomContentPostfix}/{nuggetBase}/&language=';

// Content

globalSettings.contentLoadMethod                            = 'local';                    // 'local', 'ajax'
globalSettings.contentLoadAjaxUrl                           = '';                         // url to load json file
globalSettings.contentMode                                  = 'toggle';                   // 'toggle', 'accordeon'
globalSettings.contentStartNuggetOpenMethod                 = 'overlay';                  // 'window' = opens browser window, 'overlay' = opens overlay with iframe

// Window

globalSettings.windowAttributes                             = 'location=no,menubar=no,toolbar=no,scrollbars=yes,status=no,resizable=yes';
globalSettings.windowWidthDefault                           = 1024;
globalSettings.windowHeightDefault                          = 768;
globalSettings.windowShowPopupBlockerMessage                = true;

// Nugget

globalSettings.nuggetLocation                               = 'relative';                 // 'relative', 'absolute'
globalSettings.nuggetRelativeBasePath                       = 'nuggets/';                 // has the end with /
globalSettings.nuggetAbsoluteBasePath                       = '';                         // has the end with /
globalSettings.nuggetWidth                                  = '97%';                      // number or 'xy%'
globalSettings.nuggetHeight                                 = '97%';                      // number or 'xy%'
globalSettings.nuggetMaxWidth                               = '97%';                      // number or 'xy%'
globalSettings.nuggetMaxHeight                              = '97%';                      // number or 'xy%'
globalSettings.nuggetTransition                             = 'elastic';                  // 'none', 'elastic', 'fade'
globalSettings.nuggetTransitionSpeed                        = 300;                        // number

// Search

globalSettings.searchEmptyInputAfterApplicationChange       = true;
globalSettings.searchSuggestionsMinChars                    = 2;
globalSettings.searchSuggestionsLookupLimit                 = 7;
globalSettings.searchSuggestionsMustStartWithQuery          = false;
globalSettings.searchSuggestionsIgnoreAccent                = true;
globalSettings.searchSuggestionsOnFocus                     = false;
globalSettings.searchShowHint                               = false;
globalSettings.searchShowNoSuggestionNotice                 = false;
globalSettings.searchStartAfterSuggestionSelect             = true;
globalSettings.searchAllowEmptyQuerys                       = true;
globalSettings.searchIgnoreCase                             = true;
globalSettings.searchOperator                               = 'and';                       // 'and', 'or'
globalSettings.searchHighlightResults                       = true;
globalSettings.searchResultLimitToIgnoreOtherApplications   = 10;
globalSettings.searchOtherApplicationsResultLimit           = 100;
globalSettings.searchShowResultPerPage                      = 10;
globalSettings.searchShowMoreElementsAutomatically          = true;
globalSettings.searchHitBoostTitle                          = 7;
globalSettings.searchHitBoostDescription                    = 1;

// Addition buttons

globalSettings.enableAdditionalButtons                      = false;
globalSettings.enableShowShowAllButton                      = true;

// Share

globalSettings.enableShareModeOnStart                       = true;
globalSettings.enableShareModeParameter                     = true;
globalSettings.enableShareModeToggle                        = true;
globalSettings.enableShareButtonMail                        = true;
globalSettings.enableShareButtonClipboard                   = true;
globalSettings.closeShareFunctionsAfterClick                = true;

// xapi (see also xapiconfiguration.js)

globalSettings.sendStatements                               = false;
globalSettings.sendPlayerLaunchStatement                    = false;                      // set to false if nugget player will send statement
globalSettings.sendPlayerExitStatement                      = false;                      // set to false if nugget player will send statement
globalSettings.sendSearchItemCalledStatement                = true;
globalSettings.preserveRegistration                         = true;                       // preserve the context registration on reload
globalSettings.lrsEndpoint                                  = '';
globalSettings.lrsUser                                      = '';
globalSettings.lrsPassword                                  = '';


// **************************************************
// Versionseinstellungen NuggetFinder
// **************************************************

var versionInformation = new Object();

versionInformation.enableVersionInformation                 = true;
versionInformation.currentFrameworkVersion                  = '6.1.0';
versionInformation.showCustomisationInformation             = false;
versionInformation.customerName                             = '';