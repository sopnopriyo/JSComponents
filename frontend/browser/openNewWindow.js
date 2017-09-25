/**
 * Attempts to open a new browser window to the URL
 * In most cases this will result to a new tab (browser settings dependent).
 * 
 * While this function attempts to bypass 
 * Note that due to popup blockers, etc. This is not 100% reliable.
 * As such do not perform critical redirection here, in which the user cannot easily "redo"
 * 
 * See: https://stackoverflow.com/questions/4907843/open-a-url-in-a-new-tab-and-not-a-new-window-using-javascript
 * 
 * @param  url     to open the window into
 * @param  target  defaults to "_blank", the mode which the window should open as
 */
export default function openNewWindow(url, target) {
	// Normalize the mode setting
	target = target || "_blank";

	// Create the link to "click"
	let link = document.createElement("a");
	link.href = url;
	link.target = target;

	// Overwriting the link style, to prevent default styles / layout changes
	link.style.width = "0px";
	link.style.height = "0px";
	link.style.overflow = "hidden";
	
	// Inject into the body
	document.body.appendChild(link);

	// Does the click : and the URL opening
	link.click();

	// Remove the element
	document.body.removeChild(link);
};