// This script is used to create a new tag in the profile edit modal
// It uses TomSelect to create a new tag, and then dispatches a custom event to the main search component
// to update the list of tags in the search bar

// TomSelect is a select replacement library that allows for tagging, searching, and other features
//
window.tomSettings = {

    plugins: {
        remove_button: {
            title: 'Remove this item',
        }
    },
    /*
    when a new item is added to a list client side with TomSelect, an 'item_add' event is triggered,
    which calls the 'create' function below
    */
    create: async function (input, callback) {
        console.debug("create function triggered", input)

        // A django select2 view provided by DAL expects a POST with form-encoded data, not json
        // So, we need to use FormData object to create the object.
        // For more, see:
        // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest_API/Using_FormData_Objects
        data = new FormData()
        data.append('text', input)
        data.append('create', true)

        console.debug("sending a fetch POST request to create a new tag")
        try {
            const response = await fetch('https://cat.cl8.localhost/api/autocomplete/tags/', {
                method: 'POST',
                headers: {
                    // when sending FormData objects via fetch, we don't specifically set the content type
                    // the browser needs to do this so it can multipart form boundary data between uploaded files 
                    // and form data.
                    // we still need our django csrf token though
                    'X-CSRFToken': '{{ csrf_token }}'
                },
                body: data
            })

            // we have data back from the server, reshape it so we can pass it to TomSelect to use
            // when updating the DOM for us, and to pass along as a customEvent for interested components 
            data = await response.json()
            const newItemPayload = { value: data.id, text: input }

            // 'callback' is used internally by TomSelect to add the new item to the list
            // see createItem, and carry out clean up
            // https://github.com/orchidjs/tom-select/blob/master/src/tom-select.ts#L2069
            callback(newItemPayload);

            // Now we have created a new tag, we need the new tag to exist as an option in the list of hidden our main search component. 
            // We trigger a custom event on the document body, to be picked up by code in the main search component
            document.body.dispatchEvent(new CustomEvent("profile-tag-created", { detail: newItemPayload }))

        } catch (error) {
            console.error('Error:', error);
        }
    },

    /* 
    'load' is called when we type new items into the search bar, to fetch matching entries for typed tag names
    */
    load: async function (query, callback) {
        // TomSelect does not expect the 'create new' option that is returned by the TagAutoCompleteView that was
        // designed for select2.
        // So we use the 'tags-read-only' end point for fetching suggestions, and create new tags via the 
        // create function above
        const response = await fetch(
            `https://cat.cl8.localhost/api/autocomplete/tags-read-only/?q=${query}`
        );
        const data = await response.json();

        let convertedData = data.results.map(function (item) {
            return { value: item.id, text: item.text }
        });

        // callback is used internally by TomSelect to populate the list of options
        callback(convertedData);
    },
};

window.modalProfileTagTomSelect = new TomSelect("#id_editform-tags", tomSettings);