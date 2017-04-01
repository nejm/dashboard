/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.smi.dao;

import com.smi.model.Users;
import com.smi.service.ImplUserService;
import java.util.ArrayList;
import java.util.List;
import org.apache.log4j.Logger;
import org.hibernate.Criteria;
import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.boot.registry.StandardServiceRegistry;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.hibernate.cfg.Configuration;
import org.hibernate.criterion.Restrictions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository("userDao")
public class UserDaoImpl implements UserDao {

    final static Logger logger = Logger.getLogger(UserDaoImpl.class);

    private  SessionFactory sessionFactory;

    private Session session;

    public SessionFactory getSessionFactory() {
        return sessionFactory;
    }

    public void setSessionFactory(SessionFactory sessionFactory) {
        this.sessionFactory = sessionFactory;
    }

    private void createSessionFactory(){
         if(sessionFactory == null)
            sessionFactory = new Configuration().configure().buildSessionFactory();
    }
    @Override
    public Users findByUsername(String username) {
        createSessionFactory();
        session = sessionFactory.getCurrentSession();
        session.beginTransaction();
        Query q = session.createQuery("SELECT u from Users u where username = :username").setParameter("username", username);
    
        if (q.uniqueResult() == null) {
            return null;
        }
        return (Users) q.uniqueResult();
    }

    @Override
    public List<Users> findAll() {
        List<Users> users = new ArrayList<Users>();

        users = sessionFactory.getCurrentSession().createQuery("SELECT u from Users u").list();
        return users;

    }

}
