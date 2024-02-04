# Dompressor Chrome Extension

## A lightweight DOM compressor

Installation:

Clone into a directory:

```
git clone https://github.com/peterwangsc/dompressor.git
```

Open the chrome extensions settings by navigating to the url:

```
chrome://extensions
```

Enable developer mode in the top right corner:

![image](https://github.com/peterwangsc/dompressor/assets/2318867/f3b61879-43ac-437c-91a6-f0b9df7ab852)

Import the directory by clicking on Load Unpacked:

![image](https://github.com/peterwangsc/dompressor/assets/2318867/95eb539e-826d-465c-9011-94f8ae84b201)

And selecting the dompressor folder:

![image](https://github.com/peterwangsc/dompressor/assets/2318867/25836744-d16e-45b7-a349-bc80db84b881)

Pin the extension and click the icon to open the popup:

![image](https://github.com/peterwangsc/dompressor/assets/2318867/7ec5c7f7-0a39-45b1-a3ce-ab56e29e3158)

Right click on the popup and click inspect to open the developer console:

![image](https://github.com/peterwangsc/dompressor/assets/2318867/23bc5a5a-55d9-4b7e-8478-c18dfe9f220e)

Click the button and the popup console will print the output of the compressor:

![image](https://github.com/peterwangsc/dompressor/assets/2318867/fd67e76f-7713-4da1-9732-4e80090f3dcf)

---

## Considerations:

The output is a string of HTML elements which can be stored in an HTML file and opened in a browser.

The difference is that all of the irrelevant nodes are trimmed from the output so that only the useful (to LLM) data is outputted.

Some of the output that was trimmed:

- script, noscript, meta, style, and link tags
- elements with "visibility:hidden" or "display:none" styling
- elements whose children consists of only one element (excluding text nodes)

The output only renders the text nodes (wrapped in {{handlebars}} to indicate text) and leaves out everything else except each text node's immediate parent, unless the element has more than one child node.

---

## Some example outputs:

The Github Profile Page

![image](https://github.com/peterwangsc/dompressor/blob/master/example/comparison-github-profile-page.png)

https://github.com/peterwangsc/dompressor/blob/master/example/example_output-github-profile-page.html

A Wikipedia Article

![image](https://github.com/peterwangsc/dompressor/blob/master/example/comparison-wikipedia-article.png)

https://github.com/peterwangsc/dompressor/blob/master/example/example_output-wikipedia-article.html

A Google Search

![image](https://github.com/peterwangsc/dompressor/blob/master/example/comparison-google-search.png)

https://github.com/peterwangsc/dompressor/blob/master/example/example_output-google-search.html

---

## Images and Iframes

Some additional things to consider are that some elements are included inside of iframes, which have their own DOM.

In order to include the content of those iframes in the output, another loop was added to generate more HTML strings for every iframe.

Some iframes do not allow that because of CORS, so they will be left out of the output. Only iframes that are hosted on the same domain are included.

It actually took me a while to find a website with an iframe on it, but I finally stumbled upon LinkedIn which uses an iframe, as well as some other third party iframes.

![image](https://github.com/peterwangsc/dompressor/blob/master/example/images-and-iframes.png)

The images array of URLs is also added, to give the LLM a list of URLs to the visible images on the page. LLMs that have multimodality can use these URLs to load the image as an embedding.

The images array is sourced by first grabbing the images on the page, then searching the page for elements with background-image set to a URL.

The output from these two augmentations is as expected. The iframes produce their own HTML string, and the images get scraped from the DOM's image elements as well as the elements with a background-image set to a URL.
