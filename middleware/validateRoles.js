const validateRoles = (roles = []) => {
  return (req, res, next) => {
    const authUser = req.authUser;

    // Si se intenta validar los roles pero no se a autentica
    if (!authUser) {
      return res.status(400).json({
        msg: "Debe autenticarse",
      });
    }


    if (!roles.includes(authUser.role)) {
      return res.status(401).json({
        msg: `Se nesesita un rol de [${roles}] para acceder a esta funcion`,
      });
    }

    next();
  };
};


module.exports = validateRoles;