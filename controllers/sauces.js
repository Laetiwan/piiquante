const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    console.log(sauceObject);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [''],
        usersDisliked: [''],
    });  
    sauce.save()
    .then(() => { 
        res.status(201).json({message: 'Objet enregistré !'});  
        console.log(sauceObject);    
    })
    .catch(error => { res.status(400).json( { error })})
};

//like
exports.likeSauce = (req, res, next) => {
    const userId = req.body.userId;
    console.log(userId);
    const like = req.body.like;
    console.log(like);    
        
    if(like === 1) {
        Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            console.log(sauce.usersLiked);
            if ((sauce.usersLiked.includes(userId))) {
                res.status(401).json({ message : 'Not authorized'});
            } 
            else {
                Sauce.updateOne({ _id: req.params.id}, {$inc: {likes: + 1}, $push: {usersLiked: userId}})
                .then(() => res.status(200).json({message : 'Objet modifié!'}))
                .catch(error => res.status(401).json({ error }));
                console.log(sauce.usersLiked);
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
    }    

    if(like === -1) {
        Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if ((sauce.usersDisliked.includes(userId))) {
                console.log(sauce.usersDisliked);
                res.status(401).json({ message : 'Not authorized'});
            } 
            else {
                Sauce.updateOne({ _id: req.params.id}, {$inc: {dislikes: + 1}, $push: {usersDisliked: userId}})
                .then(() => res.status(200).json({message : 'Objet modifié!'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
    }
    
    if (like === 0) {
        Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if ((sauce.usersLiked.includes(userId))) {
                console.log(sauce.usersLiked);
                Sauce.updateOne({ _id: req.params.id}, {$inc: {likes: - 1}, $pull: {usersLiked: userId}})
                .then(() => res.status(200).json({message : 'Objet modifié!'}))
                .catch(error => res.status(401).json({ error }));
            } 
            if ((sauce.usersDisliked.includes(userId))) {
                console.log(sauce.usersDisliked);
                Sauce.updateOne({ _id: req.params.id}, {$inc: {dislikes: - 1}, $pull: {usersDisliked: userId}})
                .then(() => res.status(200).json({message : 'Objet modifié!'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });                
    }               
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete sauceObject._userId;
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message : 'Unauthorized request'});
            } else {
                Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Objet modifié!'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'});
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

