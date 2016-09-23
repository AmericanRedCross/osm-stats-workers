/**
 * Given some text in the form of strings this extrats the #hashtags
 *
 * Worth mentioning is that the .filter is removeing anything that looks
 * like `# hashtag` as opposed to `#hashtag` I wanted to do that with the regex
 * but for the life of me I couldn't figure it out.
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
  var preFilteredHashtags = text.match(pattern);

  // Check to see if no hashtags exist.
  if (!preFilteredHashtags) {
    return [];
  }

  // This deals with the edgecase of `# hashtag`
  // I would imagine this would manifest as a type-o `# text` as opposed to `#text` or someone just bumped `# ` and didn't notice.
  var postFilteredHashTags = preFilteredHashtags.filter(
    function(hashtag) {
      return !hashtag.includes(" ");
    }
  );

  // removing duplicates
  var hashtags = Array.from(new Set(postFilteredHashTags))
  return hashtags;
}

module.exports = getHashtags;