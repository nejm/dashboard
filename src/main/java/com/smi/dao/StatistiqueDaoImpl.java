package com.smi.dao;

import com.smi.model.Statistique;
import java.math.BigDecimal;
import java.util.List;
import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

@Repository("statDao")
public class StatistiqueDaoImpl implements StatistiqueDao {

    @Autowired
    @Qualifier("sessionFactory")
    SessionFactory sessionFactory;

    @Override
    public List<Statistique> findAll() {
        Session session = sessionFactory.getCurrentSession();
        Query q = session.getNamedQuery("Statistique.findAll");
        System.out.println(":::::::::::::"+q.list());
        return q.list();
    }

    @Override
    public void add(Statistique s) {
        Session session = sessionFactory.getCurrentSession();
        session.save(s);
    }

    @Override
    public void edit(Statistique s) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public List<Statistique> findStat() {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public Statistique findById(long id) {
        Session session = sessionFactory.getCurrentSession();
        Query q = session.getNamedQuery("Statistique.findById").setLong("id", id);
        return (Statistique) q.uniqueResult();
    }

}
