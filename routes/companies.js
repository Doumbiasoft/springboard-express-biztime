const express = require('express');
const router = new express.Router();
const ExpressError = require('../expressError');
let db = require('../db');
const slugify = require('slugify')


router.get('/', async (req, res, next)=>{
    try {
        const result = await db.query(`SELECT code,name FROM companies`);
        return res.status(200).send({ companies: result.rows });
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
        const resultCompany =  db.query(`SELECT code,name,description FROM companies WHERE code =$1`,[code]);
        const resultInvoices =  db.query(`SELECT id, amt, paid, add_date, paid_date, comp_code FROM invoices WHERE comp_code =$1`,[code]);
        const resultIndustries =  db.query(`SELECT comp.code,indus.industry FROM companies AS comp 
        LEFT JOIN companies_industries AS comp_indus ON comp.code = comp_indus.comp_code 
        LEFT JOIN industries AS indus ON indus.code = comp_indus.indus_code 
        WHERE comp.code =$1`,[code]);
        let promises = await Promise.all([resultCompany,resultInvoices,resultIndustries]);
        
         if(promises[0].rows.length === 0){
             throw new ExpressError('Company not found!',404); 
         }

        const company = {
            code:  promises[0].rows[0].comp_code,
            name: promises[0].rows[0].name,
            description: promises[0].rows[0].description,
            invoices : promises[1].rows,
            industries: promises[2].rows.map(indus => indus.industry)
        };
       
        return res.status(200).send({ company: company });
    } catch (error) {
        return next(error);
    }
});

router.post('/', async (req, res, next)=>{
    try {
        const { code, name, description } = req.body;
        const name_treated = slugify(name,{ lower: true, replacement: '_', trim: true });
        if (!code || !name_treated || !description){
            throw new ExpressError('Bad request!',400); 
        }
        const result = await db.query(`INSERT INTO companies (code, name, description) VALUES($1,$2,$3) RETURNING code,name,description`,[code,name_treated,description]);
        if(!result.rows[0]){
            throw new ExpressError('Bad request!',400); 
        }
        return res.status(201).send({ company: result.rows[0] });
    } catch (error) {
        return next(error);
    }
});

router.put('/:code', async (req, res, next)=>{
    try {
        const code = req.params.code;
        if (!code){
           throw new ExpressError('Bad request!',400); 
        }
        const { name, description }= req.body;
        if (!name || !description){
            throw new ExpressError('Bad request!',400); 
        }
        const result = await db.query(`UPDATE companies SET name=$1,description=$2 FROM companies WHERE code =$3 RETURNING code, name, description`,[name, description, code]);
        if(!result.rows[0]){
            throw new ExpressError('Company not found!',404); 
        }
        return res.status(200).send({ company: result.rows[0] });
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
           await db.query(`DELETE FROM companies WHERE code =$1`,[code]);
        
        return res.status(200).send({ status: "deleted" });
    } catch (error) {
        return next(error);
    }
});




module.exports = router;