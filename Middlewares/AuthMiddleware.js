const isAuth = (req, res, next) => {
  console.log("REQUEST SESSION IN ISAUTH", req.session.isAuth )
  if (req.session.isAuth && req.session.user) {
    next();
  } else {
    return res.send({
      status: 400,
      message: "Invalid Session, Please login Again",
    });
  }
};

module.exports = { isAuth };
