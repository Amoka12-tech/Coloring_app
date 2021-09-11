let urls = [];

export const getImageUrls = async () => {
  // Returning the static image links for the time being, as the dynamic unconflict links do not work
  // return [
  //   'https://unconflict.com/wp-content/uploads/2021/07/1-1.png',
  //   'https://unconflict.com/wp-content/uploads/2021/07/2.png',
  //   'https://unconflict.com/wp-content/uploads/2021/07/3.png',
  //   'https://unconflict.com/wp-content/uploads/2021/07/4.png',
  //   'https://unconflict.com/wp-content/uploads/2021/07/5.png',
  //   'https://unconflict.com/wp-content/uploads/2021/07/6.png',
  //   'https://unconflict.com/wp-content/uploads/2021/07/7.png',
  //   'https://unconflict.com/wp-content/uploads/2021/07/8.png',
  //   'https://unconflict.com/wp-content/uploads/2021/07/9.png',
  //   'https://unconflict.com/wp-content/uploads/2021/07/10.png',
  //   'https://unconflict.com/wp-content/uploads/2021/07/11.png',
  //   'https://unconflict.com/wp-content/uploads/2021/07/12.png',
  // ];
  if (urls.length > 0) return urls;
  try {
    const response = await fetch(
      "https://unconflict.com/wp-json/filebird/public/v1/attachment-id/?folder_id=1",
      {
        method: "get",
        headers: {
          Authorization: "Bearer PH72FkSj8iVAa1PgbDrP7NClK0179B5QYNGKdOYV",
        },
      }
    );
    const json = await response.json();
    urls = json.data.attachment_ids.map(
      (id) => `https://unconflict.com/?attachment_id=${id}`
    );
    return urls;
  } catch (error) {
    console.log(error);
    return [];
  }
};
