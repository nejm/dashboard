/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.smi.dao;

import com.smi.model.Users;
import java.util.ArrayList;
import java.util.List;
import org.apache.log4j.Logger;
import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.cfg.Configuration;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository("userDao")
public class UserDaoImpl implements UserDao {

    final static Logger logger = Logger.getLogger(UserDaoImpl.class);

    private SessionFactory sessionFactory;

    private Session session;

    private UserAndRoleImpl userAndRoleDao;

    public SessionFactory getSessionFactory() {
        return sessionFactory;
    }

    public void setSessionFactory(SessionFactory sessionFactory) {
        this.sessionFactory = sessionFactory;
    }

    private void createSessionFactory() {
        if (sessionFactory == null) {
            sessionFactory = new Configuration().configure().buildSessionFactory();
        }
    }

    @Override
    public Users findByUsername(String username) {
        createSessionFactory();
        session = sessionFactory.openSession();
        session.beginTransaction();
        Query q = session.createQuery("SELECT u from Users u where username = :username").setParameter("username", username);
        Users u = (Users) q.uniqueResult();
        return u;
    }

    @Override
    public List<Users> findAll() {
        createSessionFactory();
        session = sessionFactory.openSession();
        session.beginTransaction();
        List<Users> users = session.getNamedQuery("Users.findAll").list();
        for (Users u : users) {
            u.setPassword("");
        }
        //session.close();
        return users;

    }

    @Override
    public Users findById(long id) {
        createSessionFactory();
        session = sessionFactory.openSession();
        Query q = session.createQuery("SELECT u from Users u where id = :id").setParameter("id", id);
        session.beginTransaction();
        if (q.uniqueResult() == null) {
            return null;
        }
        return (Users) q.uniqueResult();
    }

}
