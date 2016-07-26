var getHashtags = require('../../src/common/get_hashtags.js');
var tap = require('tap');

tap.test("hashtags", function(t) {
  t.equal(JSON.stringify(getHashtags("text #hashtag more text")), JSON.stringify(["#hashtag"]));
  t.equal(JSON.stringify(getHashtags("#cheese#dog#stuff-2016")), JSON.stringify(["#cheese", "#dog", "#stuff-2016"]));
  t.equal(JSON.stringify(getHashtags("# hashtag")), JSON.stringify([]));
  t.equal(JSON.stringify(getHashtags("#00Stufff123")), JSON.stringify(["#00Stufff123"]));
  t.equal(JSON.stringify(getHashtags("asdfasdf #stuff-2016 asdasdf")), JSON.stringify(["#stuff-2016"]));
  t.end();
});
