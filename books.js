var https = require('https');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

var fetch_num = 0;
var fetch_max = 20;
var data = [];
var url_list = {};
url_list['https://book.douban.com/subject/30253372/'] = true;

fs.exists('./images/books/', function(exists){
  if(!exists){
    fs.mkdir('./images/books/', function(err){
      console.log(err);
    })
  }
})
fs.exists('./data/books/', function(exists){
  if(!exists){
    fs.mkdir('./data/books/', function(err){
      console.log(err);
    })
  }
})

function fetchData (url) {
  fetch_num++;
  if (fetch_num < fetch_max) {
    https.get(url, function (res) {
      var html = '';
      res.on('data', function (chunk) {
        html += chunk;
      })
      res.on('end', function () {
        var $ = cheerio.load(html);
        var book_info = {
          name: $('#wrapper>h1').text().replace(/\s/g, ""),
          imgUrl: $('#mainpic>a>img').attr('src')
        }
        data.push(book_info);
        save(book_info);
        $('div.content>dl>dt>a').each(function(i,e){
          var other_url = $(this).attr('href');
          if(!url_list[other_url]){
            fetchData(other_url);
            url_list[other_url] = true;
          }
        })
      })
      res.on('error', function(err){
        console.log(err)
      })
    })
  }else if(fetch_num==85){
    console.log(data);
  }
}

function save (book_info) {
  var text = JSON.stringify(book_info);
  fs.appendFile('./data/books/' + book_info.name + '.txt', text, 'utf-8', function(err){
    if(err){
      console.log(err);
    }
  })
  saveImg(book_info.name, book_info.imgUrl);
}
function saveImg(img_title,img_url) {
  var img_filename = img_title + '.jpg';
  request.head(img_url, function(error, res, body) {
    if(error){
      console.log(error);
    }
  })
  request(img_url).pipe(fs.createWriteStream('./images/books/' + img_title + '.jpg'));
}

fetchData('https://book.douban.com/subject/30253372/');
console.log('wait......');