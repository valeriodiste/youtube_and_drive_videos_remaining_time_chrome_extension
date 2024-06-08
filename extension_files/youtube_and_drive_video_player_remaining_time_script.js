/*
 * This script is used to calculate the remaining time of a video while playing in the Google Drive vidoe player (i.e. the standard YouTube video player).
 * 
 * To use this, paste in in the console of the browser while the Dvire video player is showing and while playing a video.
 * 
 * NOTE 1: sometimes you may need to copy the link of the video fila ena past it to a new tab to open it in a dedicated view (not in preview), othersise the script might not work...
 * NOTE 2: For the script to work properly, a trick is to inspect the current video duration's infos (i.e. playback time and total duration, next to the play/pause button) using chrome's web tools (e.g. click "Ctrl + Shift + C" and then click on the durations HTML elements), then paste this script in the console.
*/

function UpdatePageWithRemainingTimeInformation(printDebug = true) {
	// For the element with class "ytp-time-separator", take the value fo "ytl-time-current" and ytp-time-duration" and calculate the ramining time, then update the "ytp-time-separator" and set it to " / [remaining time] / ", at every update of "ytp-time-current"
	let current = document.querySelector('.ytp-time-current');
	let duration = document.querySelector('.ytp-time-duration');
	let separator = document.querySelector('.ytp-time-separator');
	if (current != null && duration != null && separator != null) {
		// Check if we already added the event listener
		if (separator.classList.contains("initialized-for-remaining-time")) {
			if (printDebug == true) console.log("Already initialized the remaining time...");
			return;
		}
		separator.classList.add("initialized-for-remaining-time");
		// Add the event listener (note that DOMSubtreeModified is deprecated, use MutationObserver instead)
		const updateRemainingTime = function (mutationsList, observer) {
			// Function to calculate the remaining time
			function getTimeRemaining(startTime, endTime) {
				let startDate = new Date("01/01/2007 " + startTime);
				let endDate = new Date("01/01/2007 " + endTime);
				var t = (endDate - startDate);
				var seconds = Math.floor((t / 1000) % 60);
				var minutes = Math.floor((t / 1000 / 60) % 60);
				var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
				var days = Math.floor(t / (1000 * 60 * 60 * 24));
				return {
					'total': t,
					'days': days,
					'hours': hours,
					'minutes': minutes,
					'seconds': seconds
				};
			}
			// Get the current and duration time
			let current_time = current.innerText;
			let duration_time = duration.innerText;
			if (!current_time || !duration_time
				|| duration_time.includes("LIVE") || current_time.includes("LIVE")
				|| duration_time.includes("NaN") || current_time.includes("NaN")
				|| duration_time.includes("undefined") || current_time.includes("undefined")
				|| duration_time.includes("null") || current_time.includes("null")
			) {
				return;
			}
			// Calculate the time parts
			let current_time_parts = current_time.split(":");
			let duration_time_parts = duration_time.split(":");
			// Check the length of the parts
			if (current_time_parts.length != 3) current_time_parts = ["00"].concat(current_time_parts);
			if (duration_time_parts.length != 3) duration_time_parts = ["00"].concat(duration_time_parts);
			// Calculate the remaining time
			let remaining_time = getTimeRemaining(
				current_time_parts[0] + ":" + current_time_parts[1] + ":" + current_time_parts[2],
				duration_time_parts[0] + ":" + duration_time_parts[1] + ":" + duration_time_parts[2]
			)
			// Format the remaining time
			let remaining_time_hour_str = remaining_time.hours.toString().padStart(2, '0');
			let remaining_time_min_str = remaining_time.minutes.toString().padStart(2, '0');
			let remaining_time_sec_str = remaining_time.seconds.toString().padStart(2, '0');
			let remaining_time_str = "";
			if (remaining_time.hours > 0) remaining_time_str += remaining_time_hour_str + ":";
			remaining_time_str += remaining_time_min_str + ":" + remaining_time_sec_str;
			// Update the separator
			separator.innerText = " / -" + remaining_time_str + " / ";
		}
		// Initialize the observer (acts as an event listener, for changes in the current time element)
		const observer = new MutationObserver((mutationsList, observer) => updateRemainingTime());
		observer.observe(current, { childList: true, subtree: true });
		// Print a message
		if (printDebug == true) console.log("Initialized the observer...")
	} else {
		// If the elements are not found, print a message
		if (printDebug == true) console.log("Elements not found...");
	}
}
// On every user click, try to execute the function
document.addEventListener('click', UpdatePageWithRemainingTimeInformation);

