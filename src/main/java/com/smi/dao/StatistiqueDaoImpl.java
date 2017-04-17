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
import org.springframework.transaction.annotation.Transactional;

@Repository("statDao")
public class StatistiqueDaoImpl implements StatistiqueDao {

    @Autowired
    @Qualifier("sessionFactory")
    SessionFactory sessionFactory;

    @Override
    @Transactional
    public List<Statistique> findAll() {
        Session session = sessionFactory.getCurrentSession();
        Query q = session.getNamedQuery("Statistique.findAll");
        return q.list();
    }

    @Override
    @Transactional
    public Long add(Statistique s) {
        Session session = sessionFactory.getCurrentSession();
        session.save(s);
        return s.getId();
    }

    @Override
    @Transactional
    public void edit(Statistique s) {
        Session session = sessionFactory.getCurrentSession();
        session.merge(s);
    }

    @Override
    public List<Statistique> findAvailableStat(String name) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
    
    @Override
    @Transactional
    public List<Statistique> findMyStat(String name){
        Session session = sessionFactory.getCurrentSession();
        Query q = session.getNamedQuery("Statistique.findByCreatedBy").setString("createdBy", name);
        System.out.println("com.smi.dao.StatistiqueDaoImpl.findMyStat()"+q);
        return q.list();
    }

    @Override
    @Transactional
    public Statistique findById(long id) {
        Session session = sessionFactory.getCurrentSession();
        Query q = session.getNamedQuery("Statistique.findById").setLong("id", id);
        return (Statistique) q.uniqueResult();
    }

    @Override
    @Transactional
    public boolean exist(String name) {
        Session session = sessionFactory.getCurrentSession();
        List<Statistique> list = session.getNamedQuery("Statistique.findByName").setString("name", name).list();
        if(list.size() > 0)
            return true;
        else
            return false;
    }

}
