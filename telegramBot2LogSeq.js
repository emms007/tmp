// This is a nodejs script to transfer Telegram messages into logseq inputs.
// works great with : https://github.com/hkgnp/logseq-localassets-plugin to embed media in logseq, as well as syncthing for multiple devices sync
// support Docs, Images, Audio Clip, Video


// CONFIG
// Telegram Bot token, captured upon creating a telegram bot, format looks like 1098109810:qdijoqsijdijqsd
token = '173922222:333'

// Local path where the script will find logseq. This paths is synced to multiples devices using https://syncthing.net/
localPath = "/home/user/shares/3-Sync/SyncthingCloudLink/logseq-master/"


// Create a bot that uses 'polling' to fetch new updates
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(token, {
  polling: true
});

const fs = require('fs');
const request = require('request');
//require('dotenv').config();
const path = require('path');
const fetch = require('node-fetch');

// this is used to download the file from the link
const download = (url, path, callback) => {
  //console.log("Downloading", path, url)
  request.head(url, (err, res, body) => {
    request(url).pipe(fs.createWriteStream(path)).on('close', callback);
  });
};



// handling incoming photo or any other file
bot.on('message', async (doc) => {

  const chatId = doc.chat.id;

  // there's other ways to get the file_id we just need it to get the download link
  //      console.log(doc);
  var fileId = null;
  var fileName = null;
  var fileMime = null;


  try {
    fileId = doc.photo[1].file_id;
    fileType = 'jpg';
    fileUID = doc.photo[1].file_unique_id;
  } catch (e) {}
  try {
    fileId = doc.voice.file_id;
    fileType = "ogg";
    fileUID = doc.voice.file_unique_id;
  } catch (e) {}
  try {
    fileId = doc.video.file_id;
    fileType = "mp4";
    fileUID = doc.video.file_unique_id;
  } catch (e) {}
  try {
    fileId = doc.video_note.file_id;
    fileType = "mp4";
    fileUID = doc.video_note.file_unique_id;
  } catch (e) {}
  try {
    fileId = doc.document.file_id;
    fileUID = doc.document.file_unique_id;
    fileType = doc.document.file_name.split('.').slice(-1)[0];
    fileName = doc.document.file_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    fileMime = doc.document.mime_type;
  } catch (e) {}


  if (fileId != null) {


    //      console.log('file_id',fileId)

    // an api request to get the "file directory" (file path)
    const res = await fetch(
      `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`
    );
    // extract the file path
    const res2 = await res.json();
    const filePath = res2.result.file_path;

    // now that we've "file path" we can generate the download link
    const downloadURL =
      `https://api.telegram.org/file/bot${token}/${filePath}`;

    // download the file (in this case it's an image)
    download(downloadURL, path.join(localPath + "assets/", (fileName ? fileName : `${fileUID}.${fileType}`)), () => {}
      //    console.log('Done!')
    );

  }

  // ![image.png](assets/image_1639871342691_0.png)

  //console.log(doc);
  //Write
  date = new Date(doc.date * 1000);
  dateStr = (date.getFullYear()) + "_" + ("0" + (1 + date.getMonth())).slice(-2) + "_" + ("0" + date.getDate()).slice(-2)
  timeStr = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2)
  filename = dateStr + ".md"
  text_addition = "\n- " + " (" + timeStr + ") " +
    (doc.text ?
      (doc.text.toUpperCase().indexOf('TODO') > -1 ? 'TODO ' : '') + doc.text :
      '') +
    (doc.photo ? `![image.jpg](../assets/${fileUID}.${fileType})` + (doc.caption ? doc.caption : "") : "") +
    (doc.voice ? `{{renderer :localaudio, ${fileUID}.${fileType}}}` : "") +
    (doc.document ? `{{renderer :localdocs, ${fileName}}}` : "") +
    ((doc.video || doc.video_note) ? `{{renderer :localvideo,  ${fileUID}.${fileType}}}` : "")




  //      console.log('Writting', text_addition);
  fs.appendFileSync(localPath + "journals/" + filename, text_addition + "\r\n");


  //console.log(filename,text_addition);
  bot.sendMessage(chatId, 'Received your message' + (fileId != null ? ' - media attached' : ''));

});
