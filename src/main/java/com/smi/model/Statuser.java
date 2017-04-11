
package com.smi.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.math.BigInteger;
import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.xml.bind.annotation.XmlRootElement;

/**
 *
 * @author Nejm
 */
@Entity
@Table(name = "STATUSER", catalog = "", schema = "TEST")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "Statuser.findAll", query = "SELECT s FROM Statuser s")
    , @NamedQuery(name = "Statuser.findById", query = "SELECT s FROM Statuser s WHERE s.id = :id")
    , @NamedQuery(name = "Statuser.findByIdStat", query = "SELECT s FROM Statuser s WHERE s.idStat = :idStat")
    , @NamedQuery(name = "Statuser.findByUsername", query = "SELECT s FROM Statuser s WHERE s.username = :username")
    , @NamedQuery(name = "Statuser.findByRolename", query = "SELECT s FROM Statuser s WHERE s.rolename = :rolename")})
public class Statuser implements Serializable {

    private static final long serialVersionUID = 1L;
    // @Max(value=?)  @Min(value=?)//if you know range of your decimal fields consider using these annotations to enforce field validation
    @Id
    @Basic(optional = false)
    @Column(name = "ID")
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @Column(name = "ID_STAT")
    private Long idStat;
    @Column(name = "USERNAME")
    private String username;
    @Column(name = "ROLENAME")
    private String rolename;

    public Statuser() {
    }

    public Statuser(long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdStat() {
        return idStat;
    }

    public void setIdStat(Long idStat) {
        this.idStat = idStat;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRolename() {
        return rolename;
    }

    public void setRolename(String rolename) {
        this.rolename = rolename;
    }

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (idStat != null ? idStat.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof Statuser)) {
            return false;
        }
        Statuser other = (Statuser) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "com.smi.model.Statuser[ id=" + id + " user="+ username +" role="+ rolename +" ]";
    }
    
}
