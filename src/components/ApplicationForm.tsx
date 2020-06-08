import React, { Component } from 'react';
import { Helmet } from 'react-helmet';

interface Props {
    formQuestions: [string, string][],
}

interface State {
    formAnswers: any,
    buttonState: string
}

class ApplicationForm extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      formAnswers: {},
      buttonState: ''
    };
    this.handleChangeFormValue = this.handleChangeFormValue.bind(this);
  }

  componentDidMount() {
    const {
      formQuestions,
    } = this.props;
    const {
      formAnswers,
    } = this.state;
    formQuestions.map((entry) => (formAnswers[entry[0]] = ''));
    this.setState({ formAnswers });
  }

  handleChangeFormValue(event: any) {
    const {
      formAnswers,
    } = this.state;
    const { id } = event.target;
    const { value } = event.target;
    formAnswers[id] = value;
    console.log(formAnswers);
    this.setState({ formAnswers });
  }

  onSubmit(event: any) {
    event.preventDefault();
    this.setState({buttonState: 'running'})
    const {
      formAnswers,
    } = this.state;
  }

  render() {
    const {
      formQuestions,
    } = this.props;
    return (
      <div className="container">
        <Helmet>
          <title>Fill Application</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="jumbotron jumbotron-fluid bg-white pb-0">
          <div className="container">
            <h1 className="display-4">Application Questions</h1>
            <p className="lead">Fill out your application here.</p>
          </div>
        </div>
        <form>
          {formQuestions.map(
            (entry) => (
              <div className="mt-2 mb-2">
                <label htmlFor={entry[0]} className="w-100 font-weight-bold">
                  {entry[1]}
                  <input
                    type="text"
                    className="form-control form-purple mt-1"
                    id={entry[0]}
                    placeholder="Enter response here"
                    onChange={this.handleChangeFormValue}
                    required
                  />
                </label>
              </div>
            ),
          )}
        </form>
        <button type="submit" className={`mt-2 btn btn-success loginButtonBackground ld-ext-right ${this.state.buttonState}`}>
          Submit
          <div className="ld ld-ring ld-spin" />
        </button>
      </div>
    );
  }
}

export default ApplicationForm;
