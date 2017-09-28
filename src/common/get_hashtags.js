/**
 * Given some text in the form of strings this extracts the #hashtags
 *
 * @param  {String} text This is input text containing #hashtags
 * @return {Array}      A list of all hashtags if the list is empty then there are no hashtags or bad params were passed in.
 */
function getHashtags(text){
  if (!text) {
    return [];
  }

  // Raw Extraction of Hashtags.
  var pattern = /#(.[a-zA-Z0-9-_]+)/g;
  var hashtags = text.match(pattern) || [];

  // remove duplicates
  return Array.from(new Set(hashtags));
}

module.exports = getHashtags;
