class HomeController {
  constructor() {}
  index(req, res) {
    res.send('The Shopping Application is runnning');
  }
}

module.exports = new HomeController();
