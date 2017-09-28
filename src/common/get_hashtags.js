/**
 * Given some text in the form of strings this extracts the #hashtags
 *
 * @param  {String} text This is input text containing #hashtags
 * @return {Array}      A list of all hashtags if the list is empty then there are no hashtags or bad params were passed in.
 */
function getHashtags (text) {
  // Raw Extraction of Hashtags.
  return Array.from(new Set((text || '').match(/(#[^\d][^#\s,]*)/g))).map(x =>
    x.replace('#', '')
  );
}

module.exports = getHashtags;
