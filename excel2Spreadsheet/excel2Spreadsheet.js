var KEY = 'AIzaSyDYH20I3I42WScUTxuahtXqmQLdoYnqn2s'; //developer key , https://code.google.com/apis/console/ で取得します。 

/**
 * ExcelファイルからSpreadsheetへの変換
 * @param {Blob} excelFile Excelファイル
 * @param {String} filename Driveへアップロードする際のファイル名
 * @return {SpreadsheetApp.Spreadsheet} Spreadsheetインスタンス
 **/
function convert2Spreadsheet(excelFile, filename) {
  var oauthConfig = UrlFetchApp.addOAuthService('drive');

  //OAuthの設定
  var scope = 'https://www.googleapis.com/auth/drive';
  oauthConfig.setConsumerKey('anonymous');
  oauthConfig.setConsumerSecret('anonymous');
  oauthConfig.setRequestTokenUrl('https://www.google.com/accounts/OAuthGetRequestToken?scope='+scope);
  oauthConfig.setAuthorizationUrl('https://accounts.google.com/OAuthAuthorizeToken');    
  oauthConfig.setAccessTokenUrl('https://www.google.com/accounts/OAuthGetAccessToken');  

  var uploadParams = {
    method:'post',
    oAuthServiceName: 'drive',
    oAuthUseToken: 'always',
    contentType: 'application/vnd.ms-excel',
    contentLength: excelFile.getBytes().length,
    payload: excelFile.getBytes()
  };

  //Google Driveのルートフォルダへ対象ファイルを変換しつつアップロード
  var uploadResponse = UrlFetchApp.fetch('https://www.googleapis.com/upload/drive/v2/files/?uploadType=media&convert=true&key='+KEY, uploadParams);

  //JSONで帰ってくる 細かい話は→ https://developers.google.com/drive/v2/reference/files#resource
  var fileDataResponse = JSON.parse(uploadResponse.getContentText());

  //ファイル名を更新
  var updateParams = {
    method:'put',
    oAuthServiceName: 'drive',
    oAuthUseToken: 'always',
    contentType: 'application/json',
    payload: JSON.stringify({ title: filename })
  };

    //更新
    UrlFetchApp.fetch('https://www.googleapis.com/drive/v2/files/'+fileDataResponse.id+'?key='+KEY, updateParams);

    //Spreadsheetインスタンス取得して返却
    return SpreadsheetApp.openById(fileDataResponse.id);
}
