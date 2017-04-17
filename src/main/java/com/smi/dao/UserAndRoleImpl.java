/*
 * Copyright 2017 Nejm.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.smi.dao;

import com.smi.model.Role;
import com.smi.model.Users;
import com.smi.model.Usersandroles;
import java.util.ArrayList;
import java.util.List;
import org.apache.log4j.Logger;
import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.springframework.stereotype.Repository;

@Repository("userandrole")
public class UserAndRoleImpl implements UserAndRoleDao{

    final static Logger logger = Logger.getLogger(UserAndRoleDao.class);

    private  SessionFactory sessionFactory;

    
    private RoleDao roleDao;

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
    public List<String> findByUser(long id){
        createSessionFactory();
        Session session = sessionFactory.openSession();
        session.beginTransaction();
        Query q = session.getNamedQuery("Usersandroles.findByUserId").setLong("userId", id);
        Query q2;
        Role role;
        List<Usersandroles> roles = q.list();
        roleDao = new RoleDaoImpl();
        List<String> rolesNames = new ArrayList<String>();
        for (Usersandroles r : roles) {
            q2 = session.getNamedQuery("Role.findByRoleId").setLong("roleId", r.getRoleId());
            role = (Role) q2.uniqueResult();
            rolesNames.add("ROLE_"+role.getRoleName());
            
        }
        return rolesNames;
    }
    
}
