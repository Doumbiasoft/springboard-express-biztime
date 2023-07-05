const express = require('express');
const router = new express.Router();
const ExpressError = require('../expressError');
let db = require('../db');


router.get('/', async (req, res, next)=>{
    try {
        let list=[];
        const resultIndustries = await db.query(`SELECT code, industry FROM industries`);
        for (let el of resultIndustries.rows){
            const resultCompanies = await db.query(`SELECT comp.code FROM companies AS comp 
            LEFT JOIN companies_industries AS comp_indus ON comp.code = comp_indus.comp_code 
            LEFT JOIN industries AS indus ON comp_indus.indus_code = indus.code WHERE comp_indus.indus_code=$1`,[el.code]);
            list.push({code: el.code, name: el.industry, companies: resultCompanies.rows.map(comp => comp.code) });
        }
        return res.status(200).send({ industries: list});
    } catch (error) {
        return next(error);
    }
});

router.get('/:code', async (req, res, next)=>{
    try {
        const code = req.params.code;
        if (!code){
           throw new ExpressError('Bad request!',400); 
        }
        const resultIndustry = await db.query(`SELECT code, industry FROM industries WHERE code =$1`,[code]);
                
         if(!resultIndustry.rows[0]){
             throw new ExpressError('Industry not found!',404); 
         }
       
        return res.status(200).send({ industry: resultIndustry.rows[0] });
    } catch (error) {
        return next(error);
    }
});

router.post('/', async (req, res, next)=>{
    try {
        const { code, industry } = req.body;
        if (!code || !industry ){
            throw new ExpressError('Bad request!',400); 
        }
        const result = await db.query(`INSERT INTO industries (code, industry) VALUES($1,$2) RETURNING code,industry`,[code,industry]);
        if(!result.rows[0]){
            throw new ExpressError('Bad request!',400); 
        }
        return res.status(201).send({ industry: result.rows[0] });
    } catch (error) {
        return next(error);
    }
});
router.post('/company', async (req, res, next)=>{
    try {
        const { comp_code, indus_code } = req.body;
        if (!comp_code || !indus_code ){
            throw new ExpressError('Bad request!',400); 
        }
        const result = await db.query(`INSERT INTO companies_industries (comp_code, indus_code) VALUES($1,$2) RETURNING comp_code,indus_code`,[comp_code,indus_code]);
        if(!result.rows[0]){
            throw new ExpressError('Bad request!',400); 
        }
        return res.status(201).send({ companies_industries: result.rows[0] });
    } catch (error) {
        return next(error);
    }
});


router.delete('/:code', async (req, res, next)=>{
    try {
        const code = req.params.code;
        if (!code){
           throw new ExpressError('Bad request!',400); 
        }
           await db.query(`DELETE FROM industries WHERE code =$1`,[code]);
        
        return res.status(200).send({ status: "deleted" });
    } catch (error) {
        return next(error);
    }
});



module.exports = router;