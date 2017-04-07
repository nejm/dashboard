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
import org.hibernate.cfg.Configuration;
import org.springframework.stereotype.Repository;

@Repository("userDao")
public class UserDaoImpl implements UserDao {

    final static Logger logger = Logger.getLogger(UserDaoImpl.class);

    private  SessionFactory sessionFactory;

    private Session session;
    
    private UserAndRoleImpl userAndRoleDao;
    
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
        Users u = (Users) q.uniqueResult();
        return u;
    }
    
    public List<String> findRoles(long id){
        userAndRoleDao = new  UserAndRoleImpl();
        return userAndRoleDao.findByUser(id);
    }

    @Override
    public List<Users> findAll() {
        createSessionFactory();
        session = sessionFactory.getCurrentSession();
        session.beginTransaction();
        List<Users> users = new ArrayList<Users>();
        users = session.createQuery("SELECT u from Users u").list();
        return users;

    }

    @Override
    public Users findById(long id) {
        createSessionFactory();
        session = sessionFactory.getCurrentSession();
        session.beginTransaction();
        Query q = session.createQuery("SELECT u from Users u where id = :id").setParameter("id", id);
    
        if (q.uniqueResult() == null) {
            return null;
        }
        return (Users) q.uniqueResult();
    }

}
