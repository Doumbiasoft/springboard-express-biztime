const express = require('express');
const router = new express.Router();
const ExpressError = require('../expressError');
let db = require('../db');


router.get('/', async (req, res, next)=>{
    try {
        const result = await db.query(`SELECT id, comp_code FROM invoices`);
        return res.status(200).send({ invoices: result.rows });
    } catch (error) {
        return next(error);
    }
});

router.get('/:id', async (req, res, next)=>{
    debugger;
    try {
        const id = req.params.id;
        if (!id){
           throw new ExpressError('Bad request!',400); 
        }
        const result = await db.query(`SELECT inv.id, inv.amt, inv.paid, inv.add_date, inv.paid_date, inv.comp_code, comp.code, comp.name, comp.description FROM invoices AS inv INNER JOIN companies AS comp ON (inv.comp_code = comp.code) WHERE inv.id =$1`,[id]);
        if(!result.rows[0]){
            throw new ExpressError('Invoice no found!',404);
        }
        const data = result.rows[0];
        const invoice = {
            id: data.id,
            amt: data.amt,
            paid: data.paid,
            add_date: data.add_date,
            paid_date: data.paid_date,
                company: {
                    code: data.comp_code,
                    name: data.name,
                    description: data.description,
                }
        };

        return res.status(200).send({ invoice: invoice });
    } catch (error) {
        return next(error);
    }
});

router.post('/', async (req, res, next)=>{
    try {
        const { comp_code, amt } = req.body;
        const current_date = new Date();
        if (!comp_code || !amt){
            throw new ExpressError('Bad request!',400); 
        }
        const result = await db.query(`INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) VALUES($1,$2,$3,$4,$5) RETURNING id, comp_code, amt, paid, add_date, paid_date`,[comp_code,amt,false,current_date,null]);
        if(!result.rows[0]){
            throw new ExpressError('Bad request!',400);
        }
        return res.status(201).send({ invoice: result.rows[0] });
    } catch (error) {
        return next(error);
    }
});

router.put('/:id', async (req, res, next)=>{
    try {
        const id = req.params.id;
        if (!id){
           throw new ExpressError('Bad request!',400); 
        }
        const { amt }= req.body;
        if (!amt){
            throw new ExpressError('Bad request!',400); 
        }
        const result = await db.query(`UPDATE invoices SET amt=$1 FROM companies WHERE id =$2 RETURNING id, comp_code, amt, paid, add_date, paid_date`,[amt, id]);
        if(!result.rows[0]){
            throw new ExpressError('Company no found!',404); 
        }
        return res.status(200).send({ invoice: result.rows[0] });
    } catch (error) {
        return next(error);
    }
});

router.delete('/:id', async (req, res, next)=>{
    try {
        const id = req.params.id;
        if (!id){
           throw new ExpressError('Bad request!',400); 
        }
        await db.query(`DELETE FROM invoices WHERE id =$1`,[id]);
        
        return res.status(200).send({ status: "deleted" });
    } catch (error) {
        return next(error);
    }
});




module.exports = router;