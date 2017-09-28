/**
 * Given some text in the form of strings this extracts the #hashtags
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
  var hashtags = text.match(pattern) || [];

  // remove duplicates
  return Array.from(new Set(hashtags));
}

module.exports = getHashtags;
