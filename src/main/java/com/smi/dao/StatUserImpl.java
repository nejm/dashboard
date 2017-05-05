package com.smi.dao;

import com.smi.model.Statuser;
import java.util.List;
import org.hibernate.Query;
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

    @Override
    @Transactional
    public List<Statuser> findByUser(String username) {
        Session session = sessionFactory.getCurrentSession();
        Query query = session.getNamedQuery("Statuser.findByUsername").setString("username", username);
        return query.list();
    }

    @Override
    @Transactional
    public List<Statuser> findByRole(String roleName) {
        Session session = sessionFactory.getCurrentSession();
        Query query = session.getNamedQuery("Statuser.findByRolename").setString("rolename", roleName);
        return query.list();
    }

    @Override
    @Transactional
    public void delete(Statuser statuser) {
        Session session = sessionFactory.getCurrentSession();
        session.delete(statuser);
    }

    @Override
    @Transactional
    public List<Statuser> findByStats(Long id) {
        Session session = sessionFactory.getCurrentSession();
        Query query = session.getNamedQuery("Statuser.findByIdStat").setLong("idStat", id);
        return query.list();
    }
    
}
