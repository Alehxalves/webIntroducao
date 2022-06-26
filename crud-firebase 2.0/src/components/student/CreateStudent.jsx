import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import FirebaseContext from "../../utils/FirebaseContext";
import FirebaseStudentService from "../../services/FirebaseStudentService";
import RestrictPage from "../../utils/RestrictPage";

const CreateStudentPage = ({ setShowToast, setToast }) => (
  <FirebaseContext.Consumer>
    {(firebase) => {
      return (
        <RestrictPage isLogged={firebase.getUser() != null}>
          <CreateStudent
            firebase={firebase}
            setShowToast={setShowToast}
            setToast={setToast}
          />
        </RestrictPage>
      );
    }}
  </FirebaseContext.Consumer>
);

const CreateStudent = (props) => {
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [ira, setIra] = useState(0);
  const [loading, setLoading] = useState(false);

  const [validate, setValidate] = useState({ name: "", course: "", ira: "" });

  const navigate = useNavigate();

  const validateFields = () => {
    let res = true;
    setValidate({ name: "", course: "", ira: "" });

    if (name === "" || course === "" || ira === "") {
      props.setToast({
        header: "Error!",
        body: "Please complete all required fields.",
      });
      props.setShowToast(true);
      setLoading(false);
      res = false;
      let validateObj = { name: "", course: "", ira: "" };
      if (name === "") validateObj.name = "is-invalid";
      if (course === "") validateObj.course = "is-invalid";
      if (ira === "") validateObj.ira = "is-invalid";
      setValidate(validateObj);
    }

    if (ira !== "" && (ira < 0 || ira > 10)) {
      props.setToast({
        header: "Error!",
        body: "The IRA must be a value between 0 and 10!",
      });
      props.setShowToast(true);
      setLoading(false);
      res = false;
      let validateObj = { name: "", course: "", ira: "" };
      validateObj.ira = "is-invalid";
      setValidate(validateObj);
    }

    return res;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);

    if (!validateFields()) return;

    const newStudent = { name, course, ira };

    FirebaseStudentService.create(
      props.firebase.getFirestoreDb(),
      () => {
        props.setToast({
          header: "Success!",
          body: `Student ${name} created successfully.`,
        });
        props.setShowToast(true);
        setLoading(false);
        navigate("/listStudent");
      },
      newStudent
    );
  };

  const renderSubmitButton = () => {
    if (loading) {
      return (
        <div style={{ paddingTop: 20 }}>
          <button className="btn btn-primary" type="button" disabled>
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            <span style={{ marginLeft: 10 }}>Loading...</span>
          </button>
        </div>
      );
    }
    return (
      <>
        <div className="form-group" style={{ paddingTop: 20 }}>
          <input
            type="submit"
            value="Create Student"
            className="btn btn-primary"
          />
        </div>
      </>
    );
  };

  return (
    <div>
      <h2>Create Student</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            className={`form-control ${validate.name}`}
            value={name == null || name === undefined ? "" : name}
            name="name"
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Course</label>
          <input
            type="text"
            className={`form-control ${validate.course}`}
            value={course ?? ""}
            name="course"
            onChange={(event) => setCourse(event.target.value)}
          />
        </div>
        <div className="form-group">
          <label>IRA</label>
          <input
            type="text"
            className={`form-control ${validate.ira}`}
            value={ira ?? 0}
            name="ira"
            onChange={(event) => setIra(event.target.value)}
          />
        </div>
        {renderSubmitButton()}
      </form>
    </div>
  );
};

export default CreateStudentPage;
