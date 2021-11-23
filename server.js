const express = require("express");
const request = require("request");
const app = express();

const getRandomNum = (num) => Math.floor(Math.random() * num + 1);

function getRandomXkcdNumber() {
  return new Promise((resolve) => {
    request("http://xkcd.com/info.0.json", function (error, response, body) {
      if (!error && response.statusCode == 200) {
        const max_num = JSON.parse(body)["num"];
        let rand = getRandomNum(max_num);

        // Avoid 404 page
        while (rand == 404) {
          rand = getRandomNum(max_num);
        }
        resolve(rand);
      } else {
        resolve(0);
      }
    });
  });
}

function getRandomXkcdImageUrl() {
  return new Promise(async (resolve) => {
    const num = await getRandomXkcdNumber();

    let xkcd_url = `http://xkcd.com/${num}/info.0.json`;
    request(xkcd_url, function (error, response, body) {
      let data;
      if (!error && response.statusCode == 200) {
        const comic = JSON.parse(body);
        const img_url = comic["img"];
        const img_title = comic["alt"];
        data = img_url;
      } else {
        data = "";
      }

      resolve(data);
    });
  });
}

// get the image
app.get("/random-xkcd", async (req, res) => {
  const imageUrl = await getRandomXkcdImageUrl();

  request(
    {
      url: imageUrl,
      encoding: null,
    },
    (err, resp, buffer) => {
      if (!err && resp.statusCode === 200) {
        // This helps with GitHub's image cache see more: https://rushter.com/counter.svg
        res.set({
          "content-type": "image/png",
          "cache-control": "max-age=0, no-cache, no-store, must-revalidate",
        });
        res.send(resp.body);
      }
    }
  );
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
