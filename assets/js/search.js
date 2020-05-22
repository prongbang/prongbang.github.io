(function() {
  function displaySearchResults(results, store) {
    var searchResults = document.getElementById("search-results");

    if (results.length) {
      var appendString = "";

      for (var i = 0; i < results.length; i++) {
        var item = store[results[i].ref];

        appendString += `
          <div items onclick="window.location = '${item.url}';" style="cursor: pointer;">
            <div data-sort-time="20180505100727">
              <div class="ampstart-card m2 blog">
                <a href="${item.url}">
                  <amp-img src="${item.cover_image}" alt="${item.title}" layout="responsive" width="1280" height="600"></amp-img>
                </a>
                <h3 class="title">${item.title}</h3>
                <p class="date">${item.date}</p>
                <p class="text">${item.short_description}</p>
                <p>&nbsp;</p> 
              </div>
            </div>
          </div>`;
      }
      searchResults.innerHTML = appendString;
    } else {
      searchResults.innerHTML = cardNotResult();
    }
  }

  function cardNotResult() {
    return `<div items>
        <div data-sort-time="20180505100727">
          <div class="ampstart-card m2 blog">
            <br/>
            <h3 class="title">No results found</h3>
            <p>&nbsp;</p> 
            <br/>
          </div>
        </div>
      </div>`;
  }

  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");

    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");

      if (pair[0] === variable) {
        return decodeURIComponent(pair[1].replace(/\+/g, "%20"));
      }
    }
  }

  var searchTerm = getQueryVariable("query");

  if (searchTerm) {
    document.getElementById("search-box").setAttribute("value", searchTerm);

    // Initalize lunr with the fields it will be searching on. I've given title
    // a boost of 10 to indicate matches on this field are more important.
    var idx = lunr(function() {
      this.field("id");
      this.field("title", { boost: 10 });
      this.field("author");
      this.field("category");
      this.field("short_description");
      this.field("cover_image");
      this.field("date");
    });

    for (var key in window.store) {
      // Add the data to lunr
      idx.add({
        id: key,
        title: window.store[key].title,
        author: window.store[key].author,
        category: window.store[key].category,
        cover_image: window.store[key].cover_image,
        short_description: window.store[key].short_description,
        date: window.store[key].date,
      });

      var results = idx.search(searchTerm); // Get lunr to perform a search
      displaySearchResults(results, window.store); // We'll write this in the next section
    }
  }
})();
