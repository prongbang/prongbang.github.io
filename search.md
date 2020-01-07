---
layout: search
---
<form action="/search.html" method="get" class="m2">
  <table style="width: 100%; margin-top:2rem;">
    <tr>
      <td style="width: 100%;">
        <input id="search-box" style="width: 100%;" placeholder="Search..." type="text" class="search-box" name="query">
      </td>
      <td>
        <button class="-tb" type="submit">Search</button >
      </td>
    </tr>
  </table>
</form>

<amp-live-list style="margin-top:2rem;" id="search-results" layout="container" data-poll-interval="15000" data-max-items-per-page="5"></amp-live-list>  

<script>
  window.store = {
    {% for post in site.posts %}
      "{{ post.url | slugify }}": {
        "title": "{{ post.title | xml_escape }}",
        "author": "{{ post.author | xml_escape }}",
        "category": "{{ post.category | xml_escape }}",
        "url": "{{ post.url | xml_escape }}",
        "cover_image": "{{ post.cover_image | xml_escape }}",
        "date": "{{ post.date | date: date_format }}",
        "short_description": "{{ post.short_description | xml_escape }}",
      }
      {% unless forloop.last %},{% endunless %}
    {% endfor %}
  };
</script>
<script src="{{site.baseurl}}/assets/js/lunr.min.js"></script>
<script src="{{site.baseurl}}/assets/js/search.js"></script>