package com.smi.dao;

import com.smi.model.Statuser;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository("statuserDao")
public class StatUserImpl implements StatUserDao{
    
    @Autowired
    @Qualifier("sessionFactory")
    SessionFactory sessionFactory;
    
    @Override
    @Transactional
    public void save(Statuser statuser) {
        Session session = sessionFactory.getCurrentSession();
        session.save(statuser);
    }

    @Override
    @Transactional
    public void edit(Statuser statuser) {
        Session session = sessionFactory.getCurrentSession();
        session.merge(statuser);
    }
    
}
