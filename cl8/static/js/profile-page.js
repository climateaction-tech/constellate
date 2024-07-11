/**
* Clear the profile slot and set the path in the url back to "/", 
* adding the GET params, then the url to the history
*/
function clearProfile() {
    console.log('clearing profile')

    // set the path in the url back to "/", adding the GET params
    // from the current URL
    const currentUrl = new URL(window.location.href)
    const newUrl = new URL('/', window.location.origin)
    newUrl.search = currentUrl.search
    window.history.pushState({}, '', newUrl)

    // then set the profile slot to the empty profile
    const emptyProfile = document.querySelector('#empty-profile').innerHTML
    document.querySelector('#profile-slot .profile').innerHTML = emptyProfile
    // the 'update-profile' profile event is mainly used on small viewports / 
    // touch devices 
    htmx.trigger("body", "update-profile")
    // with the empty profile added, we need to add the click listeners 
    // to the listed tags again
    addListenersForTagBadges()


}

if (document.querySelector('#clear-profile')) {
    document.querySelector('#clear-profile').addEventListener('click', clearProfile)
}

// close-modal event is triggered by the server when we have a 
// successful update to a profile. 
// We listen for this event to close the model we just used to edit the profile
document.body.addEventListener('close-modal', function () {
    const openDialog = document.querySelector('dialog[open]');

    if (openDialog) {
        openDialog.close();
    }
    // trigger a reload of the profile with a 'save-profile-change'
    //event. This makes sure we have the latest info for the profile
    document.body.dispatchEvent(new CustomEvent("save-profile-change"))
});

/**
 * We listen for the htmx:afterSettle for event know to trigger displaying of 
 * the profile edit modal for making edits, and when loading the profile page
 * we add the listeners to the tag badges so clicking them updates our list of profiles
 */
document.body.addEventListener("htmx:afterSettle", function (detail) {
    const dialog = detail.target.querySelector('dialog[data-onload-showmodal]');
    if (dialog) {
        dialog.showModal();
        // remove the dialog from the DOM when it's closed
        dialog.addEventListener("close", () => {
            dialog.remove();
        });
    };
    console.debug("DOM fully loaded and parsed in HTMX");

    // add click listeners to the badges on the profile page load
    addListenersForTagBadges()
});