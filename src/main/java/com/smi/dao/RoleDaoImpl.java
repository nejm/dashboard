
package com.smi.dao;

import com.smi.model.Role;
import java.util.List;
import org.apache.log4j.Logger;
import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author Nejm
 */
public class RoleDaoImpl implements RoleDao{
    final static Logger logger = Logger.getLogger(UserDaoImpl.class);

    private  SessionFactory sessionFactory;

    
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
    public Role findById(long id) {
        createSessionFactory();
        Session session = sessionFactory.getCurrentSession();
        session.beginTransaction();
        Query q = session.getNamedQuery("Role.findByRoleId").setLong("roleId", id);
        
        return (Role) q.uniqueResult();
    }

    @Override
    public List<Role> findAll() {
        createSessionFactory();
        Session session = sessionFactory.getCurrentSession();
        session.beginTransaction();
        List<Role> roles = session.getNamedQuery("Role.findAll").list();

        return roles;
    }
    
    @Override
    public Role findByName(String name) {
        createSessionFactory();
        Session session = sessionFactory.getCurrentSession();
        session.beginTransaction();
        Role role = (Role) session.getNamedQuery("Role.findByRoleName").setString("roleName", name).uniqueResult();
        
        return role;
    }
}
