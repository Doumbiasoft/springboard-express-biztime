const express = require('express');
const router = new express.Router();
const ExpressError = require('../expressError');
let db = require('../db');


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
        const resultCompany = await db.query(`SELECT code,name,description FROM companies WHERE code =$1`,[code]);
        const resultInvoices = await db.query(`SELECT id, amt, paid, add_date, paid_date, comp_code FROM invoices WHERE comp_code =$1`,[code]);

        if(!resultCompany.rows[0]){
            throw new ExpressError('Company no found!',404); 
        }
        const data = resultCompany.rows[0];
        
        const company = {
                code: data.comp_code,
                name: data.name,
                description: data.description,
                invoices : resultInvoices.rows
            };
        
        return res.status(200).send({ company: company });
    } catch (error) {
        return next(error);
    }
});

router.post('/', async (req, res, next)=>{
    try {
        const { code, name, description }= req.body;
        if (!code || !name || !description){
            throw new ExpressError('Bad request!',400); 
        }
        const result = await db.query(`INSERT INTO companies (code, name, description) VALUES($1,$2,$3) RETURNING code,name,description`,[code,name,description]);
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
            throw new ExpressError('Company no found!',404); 
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