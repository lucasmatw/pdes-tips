var mongoose = require('mongoose');
var Optional = require('optional-js');
var Activity = mongoose.model('Activity');

//para cada url configuro un metodo y una actividad.
var activitiesConfig = {
  "/ideas" : {
    GET : function(username, req, res){ 
      return new Activity({
        user : username,
            action : "visito",
            target : "los posts"
      });
    }
  },
  "/ideas" : {
  	POST : function(username, req, res){ 
    	return new Activity({
        	user : username,
          action : "subio una idea",
          target : req.body.title
      });
    }
  },
  "/ideas/:idea/postulate" : {
    PUT : function(username, req, res){ 
      return new Activity({
          user : username,
          action : "se postulo en",
          target : req.idea.title
      });
    } 
  }
}


activitiesConfig.find = function(url, method){

	console.log('finding url ' + url + ', method = ' + method);

  if(this[url]){
    return Optional.ofNullable(this[url][method]);
  } else {
    return Optional.empty();
  }

}



module.exports = activitiesConfig;