/* ******************************************************* */
/* Overlay functions                                       */
/* ******************************************************* */

/* ------------------------------------------------------- */
/* Variable                                                */
/* ------------------------------------------------------- */

var currentOverlayWidth     = null;
var currentOverlayHeight    = null;
var currentOverlayMaxWidth  = '95%';
var currentOverlayMaxHeight = '95%';

var currentOverlayTransition = 'elastic';
var currentOverlayTransitionSpeed = 300;

/* ------------------------------------------------------- */
/* Functions                                               */
/* ------------------------------------------------------- */


function showNuggetInOverlay( nuggetHref )
{
	// save values

	currentOverlayWidth     = globalSettings.nuggetWidth;
	currentOverlayHeight    = globalSettings.nuggetHeight;
	currentOverlayMaxWidth  = globalSettings.nuggetMaxWidth;
	currentOverlayMaxHeight = globalSettings.nuggetMaxHeight;

	// open colorbox

	$.colorbox(
	{
		href       : nuggetHref,
		iframe     : true,
		transition : globalSettings.nuggetTransition,
		speed      : globalSettings.nuggetTransitionSpeed,
		width      : currentOverlayWidth,
		height     : currentOverlayHeight,
		maxWidth   : currentOverlayMaxWidth,
		maxHeight  : currentOverlayMaxHeight,
		onCleanup  : function ( event )
		{
			var iframe = $( '#colorbox' ).find( 'iframe' )[0];

			// this fires onbeforunload event of the player

			iframe.src = generateAbsoluteUrl( 'pages/blank.html' );
		},
		onClosed: function ( event )
		{
			sendNuggetExitedStatement();
		}
	} );
}

function showContentInOverlay( contentHref, contentWidth, contentHeight )
{
	// save values

	currentOverlayWidth  = contentWidth;
	currentOverlayHeight = contentHeight;

	// show overlay

	$.colorbox(
	{
		href       : contentHref,
		iframe     : true,
		transition : currentOverlayTransition,
		speed      : currentOverlayTransitionSpeed,
		width      : currentOverlayWidth,
		height     : currentOverlayHeight,
		maxWidth   : currentOverlayMaxWidth,
		maxHeight  : currentOverlayMaxHeight
	} );
}

function closeOverlay()
{
	$.colorbox.remove();
}

function resizeOverlay()
{
	if ( $( '#colorbox' ).css( 'display' ) == 'block' )
	{
		$.colorbox.resize(
		{
			width      : currentOverlayWidth,
			height     : currentOverlayHeight,
			maxWidth   : currentOverlayMaxWidth,
			maxHeight  : currentOverlayMaxHeight
		} );
	}
}
